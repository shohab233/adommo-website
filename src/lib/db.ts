import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient, Db } from 'mongodb';

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
    });
    globalWithMongo._mongoClientPromise = client.connect().catch((err) => {
      console.warn('MongoDB Atlas connection error:', err.message);
      globalWithMongo._mongoClientPromise = undefined;
      throw err;
    });
  }
  return globalWithMongo._mongoClientPromise;
}

export async function getAtlasDb(): Promise<Db | null> {
  const clientP = getMongoClient();
  if (!clientP) return null;
  try {
    const client = await clientP;
    return client.db(MONGODB_DB);
  } catch (err: any) {
    console.warn('MongoDB Atlas getAtlasDb error:', err.message);
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
      await col.deleteOne({ id: itemOrId });
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
    const items = readCollection<T>(collection);
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) return false;
    writeCollection(collection, filtered);

    // Sync to Cloud
    syncToAtlas('delete', collection, id);

    return true;
  },

  // ==========================================================================
  // ASYNC CLOUD-AWARE CRUD METHODS (MONGODB ATLAS PRIMARY, LOCAL FALLBACK)
  // ==========================================================================
  findOneAsync: async <T = any>(collection: string, queryOrFilter: any): Promise<T | null> => {
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        const col = atlas.collection(collection);
        let item: any = null;
        if (typeof queryOrFilter === 'function') {
          const all = await col.find({}).toArray();
          item = (all as any[]).find(queryOrFilter);
        } else if (queryOrFilter && typeof queryOrFilter === 'object') {
          item = await col.findOne(queryOrFilter);
        }
        if (item) {
          const { _id, ...clean } = item;
          return clean as unknown as T;
        }
      }
    } catch (err: any) {
      console.warn(`findOneAsync(${collection}) Atlas warning:`, err.message);
    }
    // Local JSON fallback
    if (typeof queryOrFilter === 'function') {
      return db.findOne<T>(collection, queryOrFilter);
    }
    return null;
  },

  findManyAsync: async <T = any>(collection: string, queryOrFilter?: any): Promise<T[]> => {
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
        if (results && results.length > 0) {
          const cleaned = results.map((doc: any) => {
            const { _id, ...clean } = doc;
            return clean;
          });
          // Cache to local JSON if local file is empty or missing
          try {
            const local = readCollection(collection);
            if (!local || local.length === 0) {
              writeCollection(collection, cleaned);
            }
          } catch {}
          return cleaned as unknown as T[];
        }
      }
    } catch (err: any) {
      console.warn(`findManyAsync(${collection}) Atlas warning:`, err.message);
    }
    return db.findMany<T>(collection, typeof queryOrFilter === 'function' ? queryOrFilter : undefined);
  },

  createAsync: async <T extends Record<string, any> = any>(collection: string, item: T): Promise<T & { id: string }> => {
    const { _id, ...cleanItem } = (item || {}) as any;
    const newItem = {
      id: cleanItem.id || `id_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: cleanItem.createdAt || new Date().toISOString(),
      ...cleanItem,
    };

    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        await atlas.collection(collection).replaceOne({ id: newItem.id }, newItem, { upsert: true });
      }
    } catch (err: any) {
      console.warn(`createAsync(${collection}) Atlas warning:`, err.message);
    }

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

    // Also update local JSON file as durable backup
    try {
      const localUpdated = db.update(collection, id, updateData);
      return updatedDoc || localUpdated;
    } catch {
      return updatedDoc;
    }
  },

  deleteAsync: async (collection: string, id: string): Promise<boolean> => {
    try {
      const atlas = await getAtlasDb();
      if (atlas) {
        await atlas.collection(collection).deleteOne({ id });
      }
    } catch (err: any) {
      console.warn(`deleteAsync(${collection}) Atlas warning:`, err.message);
    }
    return db.delete(collection, id);
  }
};
