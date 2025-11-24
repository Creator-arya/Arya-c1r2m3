import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createProposta,
  getPropostasByUserId,
  getAllPropostas,
  updateProposta,
  deleteProposta,
  createComissao,
  getComissoesByUserId,
  getComissao,
  updateComissao,
  deleteComissao,
  getAllComissoes,
  getDb,
} from "./db";
import { propostas as propostasTable, users as usersTable } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  propostas: router({
    // Create a new proposal
    create: protectedProcedure
      .input(
        z.object({
          numeroProposta: z.string().min(1),
          numeroParcelas: z.number().int().positive(),
          banco: z.string().min(1),
          valor: z.string().regex(/^\d+(\.\d{1,2})?$/),
          tipo: z.enum([
            "novo",
            "refinanciamento",
            "portabilidade",
            "refin_portabilidade",
            "refin_carteira",
            "fgts",
            "clt",
            "outros",
          ]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        // Get commission for this user, bank, and type
        const comissao = await getComissao(user.id, input.banco, input.tipo);
        const comissaoPercentual = comissao?.percentual ? parseFloat(comissao.percentual.toString()) : 0;
        const valor = parseFloat(input.valor);
        const comissaoValor = (valor * comissaoPercentual) / 100;

        return createProposta({
          userId: user.id,
          numeroProposta: input.numeroProposta,
          numeroParcelas: input.numeroParcelas,
          banco: input.banco,
          valor: input.valor,
          tipo: input.tipo,
          comissao: comissaoValor.toString(),
        });
      }),

    // Get proposals for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Admins see all proposals, other users see only their own
      if (user.role === "admin") {
        return getAllPropostas();
      }
      return getPropostasByUserId(user.id);
    }),

    // Update a proposal
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          numeroProposta: z.string().min(1).optional(),
          numeroParcelas: z.number().int().positive().optional(),
          banco: z.string().min(1).optional(),
          valor: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
          tipo: z
            .enum([
              "novo",
              "refinanciamento",
              "portabilidade",
              "refin_portabilidade",
              "refin_carteira",
              "fgts",
              "clt",
              "outros",
            ])
            .optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if user owns this proposal or is admin
        const proposta = await db
          .select()
          .from(propostasTable)
          .where(eq(propostasTable.id, input.id))
          .limit(1);

        if (proposta.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (proposta[0].userId !== user.id && user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Recalculate commission if valor or tipo changed
        let updateData: any = { ...input };
        delete updateData.id;

        if (input.valor || input.tipo || input.banco) {
          const banco = input.banco || proposta[0].banco;
          const tipo = input.tipo || proposta[0].tipo;
          const valor = input.valor ? parseFloat(input.valor) : parseFloat(proposta[0].valor.toString());

          const comissao = await getComissao(proposta[0].userId, banco, tipo);
          const comissaoPercentual = comissao?.percentual ? parseFloat(comissao.percentual.toString()) : 0;
          const comissaoValor = (valor * comissaoPercentual) / 100;
          updateData.comissao = comissaoValor.toString();
        }

        return updateProposta(input.id, updateData);
      }),

    // Delete a proposal
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || !user.id) throw new TRPCError({ code: "UNAUTHORIZED" });

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Check if user owns this proposal or is admin
        const proposta = await db
          .select()
          .from(propostasTable)
          .where(eq(propostasTable.id, input.id))
          .limit(1);

        if (proposta.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        if (proposta[0].userId !== user.id && user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return deleteProposta(input.id);
      }),
  }),

  comissoes: router({
    // Create a new commission
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          banco: z.string().min(1),
          tipo: z.enum([
            "novo",
            "refinanciamento",
            "portabilidade",
            "refin_portabilidade",
            "refin_carteira",
            "fgts",
            "clt",
            "outros",
          ]),
          percentual: z.string().regex(/^\d+(\.\d{1,2})?$/),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return createComissao({
          userId: input.userId,
          banco: input.banco,
          tipo: input.tipo,
          percentual: input.percentual,
        });
      }),

    // Get commissions for a user
    listByUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        // Users can only see their own commissions, admins see all
        if (user.id !== input.userId && user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return getComissoesByUserId(input.userId);
      }),

    // Get all commissions (admin only)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return getAllComissoes();
    }),

    // Update a commission
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          percentual: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
          ativo: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const updateData: any = {};
        if (input.percentual !== undefined) updateData.percentual = input.percentual;
        if (input.ativo !== undefined) updateData.ativo = input.ativo;

        return updateComissao(input.id, updateData);
      }),

    // Delete a commission
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const user = ctx.user;
        if (!user || user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return deleteComissao(input.id);
      }),
  }),

  users: router({
    // Get all users (admin only)
    listAll: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      if (!user || user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      return db.select().from(usersTable);
    }),
  }),
});

export type AppRouter = typeof appRouter;
