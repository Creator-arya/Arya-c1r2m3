import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  passwordHash: text("passwordHash").notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin", "master"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Propostas table - stores all proposals submitted by users
 */
export const propostas = mysqlTable("propostas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  numeroProposta: varchar("numeroProposta", { length: 100 }).notNull(),
  numeroParcelas: int("numeroParcelas").notNull(),
  banco: varchar("banco", { length: 100 }).notNull(),
  valor: decimal("valor", { precision: 15, scale: 2 }).notNull(),
  tipo: mysqlEnum("tipo", [
    "novo",
    "refinanciamento",
    "portabilidade",
    "refin_portabilidade",
    "refin_carteira",
    "fgts",
    "clt",
    "outros"
  ]).notNull(),
  comissao: decimal("comissao", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Proposta = typeof propostas.$inferSelect;
export type InsertProposta = typeof propostas.$inferInsert;

/**
 * Comissões table - stores commission rates for each user and proposal type/bank combination
 */
export const comissoes = mysqlTable("comissoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  banco: varchar("banco", { length: 100 }).notNull(),
  tipo: mysqlEnum("tipo", [
    "novo",
    "refinanciamento",
    "portabilidade",
    "refin_portabilidade",
    "refin_carteira",
    "fgts",
    "clt",
    "outros"
  ]).notNull(),
  percentual: decimal("percentual", { precision: 5, scale: 2 }).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comissao = typeof comissoes.$inferSelect;
export type InsertComissao = typeof comissoes.$inferInsert;

