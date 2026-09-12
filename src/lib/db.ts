import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MongoClient } from 'mongodb';

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
  } catch (err) {
    return [];
  }
}

function writeCollection<T>(collection: string, items: T[]): void {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  } catch (err) {
    // In read-only serverless environments like Vercel, filesystem writing might be disabled
  }
}

// ============================================================================
// MONGODB ATLAS CLOUD SYNC ENGINE
// ============================================================================
const MONGODB_URI = process.env.MONGODB_URI || '';
const MONGODB_DB = process.env.MONGODB_DB || 'adommo_edtech';

let mongoClientPromise: Promise<MongoClient> | null = null;

function getMongoClient(): Promise<MongoClient> | null {
  if (!MONGODB_URI) return null;
  if (!mongoClientPromise) {
    const client = new MongoClient(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    mongoClientPromise = client.connect().catch((err) => {
      console.warn('MongoDB Atlas connection warning:', err.message);
      mongoClientPromise = null;
      throw err;
    });
  }
  return mongoClientPromise;
}

// Asynchronously sync data mutation to MongoDB Atlas in background
function syncToAtlas(action: 'upsert' | 'delete', collection: string, itemOrId: any) {
  const clientP = getMongoClient();
  if (!clientP) return;

  clientP.then(async (client) => {
    try {
      const db = client.db(MONGODB_DB);
      const col = db.collection(collection);

      if (action === 'upsert') {
        const query = { id: itemOrId.id };
        await col.replaceOne(query, itemOrId, { upsert: true });
      } else if (action === 'delete') {
        await col.deleteOne({ id: itemOrId });
      }
    } catch (err: any) {
      console.warn(`Atlas sync (${collection}) warning:`, err.message);
    }
  }).catch(() => {});
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
  }
};
