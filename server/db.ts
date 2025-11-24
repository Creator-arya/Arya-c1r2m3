import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, propostas, InsertProposta, comissoes, InsertComissao } from "../drizzle/schema";
import { ENV } from './_core/env';
import bcryptjs from 'bcryptjs';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

export async function createUser(username: string, password: string, name: string, email: string, role: 'user' | 'admin' | 'master' = 'user'): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const passwordHash = await hashPassword(password);
  
  const result = await db.insert(users).values({
    username,
    passwordHash,
    name,
    email,
    role,
  });

  return result;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  return db.select().from(users);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(users).set(data).where(eq(users.id, id));
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.delete(users).where(eq(users.id, id));
}

/**
 * Propostas queries
 */
export async function createProposta(proposta: InsertProposta) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(propostas).values(proposta);
  return result;
}

export async function getPropostasByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(propostas).where(eq(propostas.userId, userId));
}

export async function getAllPropostas() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(propostas);
}

export async function updateProposta(id: number, data: Partial<InsertProposta>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(propostas).set(data).where(eq(propostas.id, id));
}

export async function deleteProposta(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(propostas).where(eq(propostas.id, id));
}

/**
 * Comissões queries
 */
export async function createComissao(comissao: InsertComissao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(comissoes).values(comissao);
}

export async function getComissoesByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(comissoes).where(eq(comissoes.userId, userId));
}

export async function getComissao(userId: number, banco: string, tipo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(comissoes)
    .where(
      and(
        eq(comissoes.userId, userId),
        eq(comissoes.banco, banco),
        eq(comissoes.tipo, tipo as any),
        eq(comissoes.ativo, true)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateComissao(id: number, data: Partial<InsertComissao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(comissoes).set(data).where(eq(comissoes.id, id));
}

export async function deleteComissao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.delete(comissoes).where(eq(comissoes.id, id));
}

export async function getAllComissoes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(comissoes);
}

import { and } from "drizzle-orm";
