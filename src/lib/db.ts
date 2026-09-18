import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db, ObjectId } from 'mongodb';

// Data storage directory in project root
const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

function getFilePath(collection: string) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection<T>(collection: string): T[] {
  const filePath = getFilePath(collection);
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(data) || [];
  } catch {
    return [];
  }
}

function writeCollection<T>(collection: string, items: T[]): void {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch {
    // In read-only serverless environments like Vercel, filesystem writing might be disabled
  }
}

// ============================================================================
// HIGH-SPEED IN-MEMORY CACHE WITH CLOUD INVALIDATION
// ============================================================================
const memoryCache: Record<string, { data: any[]; timestamp: number }> = {};
const CACHE_TTL_MS = 20 * 1000; // 20 seconds TTL

// ============================================================================
// DELETED RECORDS TRACKER (PREVENTS RESURRECTION ON READ-ONLY SERVERLESS)
// ============================================================================
const deletedRecordIds: Set<string> = new Set();
let _deletedRecordsLoaded = false;

export function markRecordAsDeleted(collection: string, id: string): void {
  if (!id) return;
  const cleanId = String(id).trim();
  deletedRecordIds.add(`${collection}:${cleanId}`);
}

export function isRecordDeleted(collection: string, id: any): boolean {
  if (!id) return false;
  const cleanId = String(id).trim();
  return deletedRecordIds.has(`${collection}:${cleanId}`);
}

export function getCachedCollection<T>(collection: string): T[] | null {
  const cached = memoryCache[collection];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return (cached.data as T[]).filter((item: any) => !isRecordDeleted(collection, item?.id));
  }
  return null;
}

export function setCachedCollection<T>(collection: string, items: T[]): void {
  memoryCache[collection] = {
    data: (items || []).filter((item: any) => !isRecordDeleted(collection, item?.id)),
    timestamp: Date.now(),
  };
}

export function invalidateCollectionCache(collection: string): void {
  delete memoryCache[collection];
}

// ============================================================================
// MONGODB ATLAS CLOUD CONNECTION & SINGLETON ENGINE
// ============================================================================
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'adommo_edtech';

export function getMongoClient(): Promise<MongoClient> | null {
  if (!MONGODB_URI) return null;

  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.warn('MongoDB Atlas connection error (falling back to local JSON):', err.message);
      globalWithMongo._mongoClientPromise = undefined;
      return null as any;
    });
  }
  return globalWithMongo._mongoClientPromise;
}

let _indexesEnsured = false;
export async function ensureDbIndexes(): Promise<void> {
  if (_indexesEnsured) return;
  try {
    const atlas = await getAtlasDb();
    if (!atlas) return;
    _indexesEnsured = true;

    // 1. Users collection indexes (for instant login & registration check)
    const usersCol = atlas.collection('users');
    await usersCol.createIndex({ id: 1 }, { unique: true, sparse: true });
    await usersCol.createIndex({ phone: 1, role: 1 });
    await usersCol.createIndex({ email: 1, role: 1 });

    // 2. Courses collection indexes (for fast catalog querying & sorting)
    const coursesCol = atlas.collection('courses');
    await coursesCol.createIndex({ id: 1 }, { unique: true, sparse: true });
    await coursesCol.createIndex({ isPublished: 1, category: 1 });

    // 3. Enrollments collection indexes
    const enrollmentsCol = atlas.collection('enrollments');
    await enrollmentsCol.createIndex({ id: 1 }, { unique: true, sparse: true });
    await enrollmentsCol.createIndex({ studentId: 1, courseId: 1 });
  } catch (err: any) {
    // Indexes might already exist
  }
}

export async function getAtlasDb(): Promise<Db | null> {
  const clientP = getMongoClient();
  if (!clientP) return null;
  try {
    const client = await clientP;
    if (!client) return null;
    const db = client.db(MONGODB_DB);
    if (!_indexesEnsured) {
      setTimeout(() => ensureDbIndexes().catch(() => {}), 100);
    }
    return db;
  } catch (err: any) {
    console.warn('MongoDB Atlas getAtlasDb error (using local JSON storage):', err.message);
    return null;
  }
}

// Asynchronously sync data mutation to MongoDB Atlas
async function syncToAtlas(action: 'upsert' | 'delete', collection: string, itemOrId: any) {
  try {
    const atlas = await getAtlasDb();
    if (!atlas) return;
    const col = atlas.collection(collection);
    if (action === 'upsert') {
      const { _id, ...cleanItem } = itemOrId || {};
      const query = { id: cleanItem.id };
      await col.replaceOne(query, cleanItem, { upsert: true });
    } else if (action === 'delete') {
      const cleanId = String(itemOrId || '').trim();
      if (!cleanId) return;
      markRecordAsDeleted(collection, cleanId);
      try {
        await atlas.collection('deleted_records').updateOne(
          { collection, id: cleanId },
          { $set: { collection, id: cleanId, deletedAt: new Date().toISOString() } },
          { upsert: true }
        );
      } catch {}
      const deleteQuery: any = {
        $or: [
          { id: cleanId },
          { _id: cleanId }
        ]
      };
      if (ObjectId.isValid(cleanId) && cleanId.length === 24) {
        deleteQuery.$or.push({ _id: new ObjectId(cleanId) });
      }
      await col.deleteMany(deleteQuery);
    }
  } catch (err: any) {
    console.warn(`Atlas sync (${collection}) warning:`, err.message);
  }
}

// ============================================================================
// SECURITY & AUTH UTILITIES
// ============================================================================
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  const [salt, originalHash] = combinedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

const JWT_SECRET = process.env.JWT_SECRET || 'adommo_super_secret_jwt_key_2026_production';

export function signToken(payload: object, expiresInHours: number = 72): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + (expiresInHours * 3600);
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken<T>(token: string): T | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [header, body, signature] = token.split('.');
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed as T;
  } catch (err) {
    return null;
  }
}

// Helper to match in-memory documents against functions or Mongo-like queries
function matchDoc(doc: any, queryOrFilter: any): boolean {
  if (!doc) return false;
  if (typeof queryOrFilter === 'function') {
    return !!queryOrFilter(doc);
  }
  if (!queryOrFilter || typeof queryOrFilter !== 'object') {
    return true;
  }
  for (const [key, value] of Object.entries(queryOrFilter)) {
    if (key === '$or' && Array.isArray(value)) {
      const orMatched = value.some((subQuery) => matchDoc(doc, subQuery));
      if (!orMatched) return false;
    } else if (key === '$and' && Array.isArray(value)) {
      const andMatched = value.every((subQuery) => matchDoc(doc, subQuery));
      if (!andMatched) return false;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('$in' in (value as any) && Array.isArray((value as any).$in)) {
        if (!(value as any).$in.includes(doc[key])) return false;
      } else if ('$ne' in (value as any)) {
        if (doc[key] === (value as any).$ne) return false;
      } else if ('$regex' in (value as any)) {
        const regex = new RegExp((value as any).$regex, (value as any).$options || 'i');
        if (!regex.test(String(doc[key] || ''))) return false;
      }
    } else {
      if (typeof value === 'string' && typeof doc[key] === 'string') {
        if (doc[key].toLowerCase() !== value.toLowerCase() && doc[key] !== value) return false;
      } else if (doc[key] !== value) {
        return false;
      }
    }
  }
  return true;
}

// ============================================================================
// GENERAL CRUD REPOSITORY (LOCAL FILESYSTEM + MONGODB ATLAS CLOUD SYNC)
// ============================================================================
export const db = {
  findMany: <T>(collection: string, filter?: (item: T) => boolean): T[] => {
    const items = readCollection<T>(collection);
    return filter ? items.filter(filter) : items;
  },

  findOne: <T>(collection: string, filter: (item: T) => boolean): T | null => {
    const items = readCollection<T>(collection);
    return items.find(filter) || null;
  },

  create: <T extends Record<string, any> = any>(collection: string, item: T): T & { id: string } => {
    const items = readCollection<any>(collection);
    const newItem = {
      id: item.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...item,
    };
    items.unshift(newItem);
    writeCollection(collection, items);

    // Sync to Cloud
    syncToAtlas('upsert', collection, newItem);

    return newItem as T & { id: string };
  },

  update: <T extends Record<string, any> = any>(collection: string, id: string, data: Partial<T>): T | null => {
    const items = readCollection<any>(collection);
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return null;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    writeCollection(collection, items);

    // Sync to Cloud
    syncToAtlas('upsert', collection, items[index]);

    return items[index] as T;
  },

  delete: <T extends { id: string }>(collection: string, id: string): boolean => {
    const cleanId = (id || '').trim();
    if (!cleanId) return false;
    markRecordAsDeleted(collection, cleanId);
    const items = readCollection<T>(collection);
    const filtered = items.filter((i) => (i.id || '').trim() !== cleanId);
    if (filtered.length === items.length) return false;
    writeCollection(collection, filtered);

    // Sync to Cloud
    syncToAtlas('delete', collection, cleanId);

    return true;
  },

  // ==========================================================================
  // ASYNC CLOUD-AWARE CRUD METHODS (MONGODB ATLAS PRIMARY, LOCAL FALLBACK)
  // ==========================================================================
  findOneAsync: async <T = any>(collection: string, queryOrFilter: any, mongoFilter?: any): Promise<T | null> => {
    const directId = typeof queryOrFilter === 'object' && queryOrFilter?.id ? String(queryOrFilter.id).trim() : null;
    if (directId && isRecordDeleted(collection, directId)) {
      return null;
    }

    // 1. Fast check in-memory cache (sub-millisecond)
    let cached = getCachedCollection<T>(collection);
    if (!cached) {
      const localItems = readCollection<T>(collection).filter((item: any) => !isRecordDeleted(collection, item?.id));
      if (localItems && localItems.length > 0) {
        setCachedCollection(collection, localItems);
        cached = localItems;
      }
    }

    if (cached) {
      const found = cached.find((item: any) => matchDoc(item, queryOrFilter));
      if (found && !isRecordDeleted(collection, (found as any).id)) return found;
    }

    // 2. Direct indexed Atlas lookup
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        const col = atlas.collection(collection);
        let item: any = null;
        const directFilter = mongoFilter || (typeof queryOrFilter === 'object' && queryOrFilter !== null ? queryOrFilter : null);

        if (directFilter) {
          item = await col.findOne(directFilter);
        } else if (typeof queryOrFilter === 'function') {
          const all = await col.find({}).limit(500).toArray();
          item = (all as any[]).find(queryOrFilter);
        }

        if (item) {
          const { _id, ...clean } = item;
          if (isRecordDeleted(collection, clean.id)) {
            return null;
          }
          // Seed to in-memory cache and local file
          const currentCache = getCachedCollection<any>(collection) || [];
          if (!currentCache.some(c => c.id === clean.id)) {
            const updated = [...currentCache, clean];
            setCachedCollection(collection, updated);
            writeCollection(collection, updated);
          }
          return clean as unknown as T;
        }
        return null;
      }
    } catch (err: any) {
      console.warn(`findOneAsync(${collection}) Atlas warning, falling back to local:`, err.message);
    }

    // 3. Offline Local JSON fallback
    const items = readCollection<T>(collection).filter((item: any) => !isRecordDeleted(collection, item?.id));
    return items.find((item: any) => matchDoc(item, queryOrFilter)) || null;
  },

  findManyAsync: async <T = any>(collection: string, queryOrFilter?: any): Promise<T[]> => {
    // 1. Check in-memory cache
    let cached = getCachedCollection<T>(collection);

    // 2. If memory cache is cold, seed immediately from local disk mirror (1ms response)
    if (!cached) {
      const localItems = readCollection<T>(collection).filter((item: any) => !isRecordDeleted(collection, item?.id));
      if (localItems && localItems.length > 0) {
        setCachedCollection(collection, localItems);
        cached = localItems;

        // Background non-blocking sync from Atlas
        getAtlasDb().then(async (atlas) => {
          if (!atlas) return;
          try {
            const all = await atlas.collection(collection).find({}).toArray();
            if (all && all.length > 0) {
              const cleaned = all
                .map((doc: any) => {
                  const { _id, ...clean } = doc;
                  return clean;
                })
                .filter((item: any) => !isRecordDeleted(collection, item?.id));
              setCachedCollection(collection, cleaned);
              writeCollection(collection, cleaned);
            }
          } catch (e) {}
        }).catch(() => {});
      }
    }

    if (cached) {
      const activeCached = cached.filter((item: any) => !isRecordDeleted(collection, item?.id));
      if (queryOrFilter) {
        return activeCached.filter((item: any) => matchDoc(item, queryOrFilter));
      } else {
        return activeCached;
      }
    }

    // 3. If neither cache nor local had items, fetch from Atlas directly
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        const col = atlas.collection(collection);
        let results: any[] = [];
        if (typeof queryOrFilter === 'function') {
          const all = await col.find({}).toArray();
          results = (all as any[]).filter(queryOrFilter);
        } else if (queryOrFilter && typeof queryOrFilter === 'object') {
          results = await col.find(queryOrFilter).toArray();
        } else {
          results = await col.find({}).toArray();
        }

        const cleaned = (results || [])
          .map((doc: any) => {
            const { _id, ...clean } = doc;
            return clean;
          })
          .filter((item: any) => !isRecordDeleted(collection, item?.id));

        // Prime cache and local file
        if (!queryOrFilter) {
          setCachedCollection(collection, cleaned);
          writeCollection(collection, cleaned);
        }

        return cleaned as unknown as T[];
      }
    } catch (err: any) {
      console.warn(`findManyAsync(${collection}) Atlas warning, falling back to local:`, err.message);
    }

    // 4. Offline Local JSON fallback
    const items = readCollection<T>(collection).filter((item: any) => !isRecordDeleted(collection, item?.id));
    if (!queryOrFilter) {
      setCachedCollection(collection, items);
    }
    if (typeof queryOrFilter === 'function') {
      return items.filter(queryOrFilter);
    } else if (queryOrFilter && typeof queryOrFilter === 'object') {
      return items.filter((item: any) => {
        return Object.entries(queryOrFilter).every(([k, v]) => item[k] === v);
      });
    }
    return items;
  },

  createAsync: async <T extends Record<string, any> = any>(collection: string, item: T): Promise<T & { id: string }> => {
    const { _id, ...cleanItem } = (item || {}) as any;
    const newItem = {
      id: cleanItem.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: cleanItem.createdAt || new Date().toISOString(),
      ...cleanItem,
    };

    // Invalidate in-memory cache
    invalidateCollectionCache(collection);

    // 1. Write to Atlas
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        await atlas.collection(collection).replaceOne({ id: newItem.id }, newItem, { upsert: true });
      }
    } catch (err: any) {
      console.warn(`createAsync(${collection}) Atlas warning:`, err.message);
    }

    // 2. Write to local JSON file as backup mirror
    try {
      const items = readCollection<any>(collection);
      items.unshift(newItem);
      writeCollection(collection, items);
    } catch {}

    return newItem as T & { id: string };
  },

  updateAsync: async <T extends Record<string, any> = any>(collection: string, id: string, data: Partial<T>): Promise<T | null> => {
    const { _id, ...cleanData } = (data || {}) as any;
    const updateData = { ...cleanData, updatedAt: new Date().toISOString() };
    let updatedDoc: T | null = null;

    // Invalidate in-memory cache
    invalidateCollectionCache(collection);

    // 1. Update in Atlas
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        await atlas.collection(collection).updateOne({ id }, { $set: updateData });
        const updated = await atlas.collection(collection).findOne({ id });
        if (updated) {
          const { _id: unused, ...cleanUpdated } = updated as any;
          updatedDoc = cleanUpdated as unknown as T;
        }
      }
    } catch (err: any) {
      console.warn(`updateAsync(${collection}) Atlas warning:`, err.message);
    }

    // 2. Update in local JSON backup without duplicate Atlas sync
    try {
      const items = readCollection<any>(collection);
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...updateData };
        writeCollection(collection, items);
        if (!updatedDoc) {
          updatedDoc = items[index] as T;
        }
      }
    } catch {}

    return updatedDoc;
  },

  deleteAsync: async (collection: string, id: string): Promise<boolean> => {
    let success = false;
    const cleanId = (id || '').trim();
    if (!cleanId) return false;

    // Immediately record tombstone so no subsequent read in memory resurfaces this item
    markRecordAsDeleted(collection, cleanId);

    // 1. Delete from local JSON backup and update in-memory cache immediately
    let filtered: any[] = [];
    try {
      const items = readCollection<any>(collection);
      filtered = items.filter((i) => (i.id || '').trim() !== cleanId);
      if (filtered.length !== items.length) {
        success = true;
        writeCollection(collection, filtered);
      }
    } catch {}

    // Immediately prime cache with filtered items
    setCachedCollection(collection, filtered);

    // 2. Delete from MongoDB Atlas and save permanent tombstone
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        // Save tombstone in Atlas so any new serverless instance respects this deletion
        try {
          await atlas.collection('deleted_records').updateOne(
            { collection, id: cleanId },
            { $set: { collection, id: cleanId, deletedAt: new Date().toISOString() } },
            { upsert: true }
          );
        } catch {}

        const deleteQuery: any = {
          $or: [
            { id: cleanId },
            { _id: cleanId }
          ]
        };
        if (ObjectId.isValid(cleanId) && cleanId.length === 24) {
          deleteQuery.$or.push({ _id: new ObjectId(cleanId) });
        }
        const res = await atlas.collection(collection).deleteMany(deleteQuery);
        if ((res.deletedCount || 0) > 0) {
          success = true;
        }
      }
    } catch (err: any) {
      console.warn(`deleteAsync(${collection}) Atlas warning:`, err.message);
    }

    return success;
  }
};
