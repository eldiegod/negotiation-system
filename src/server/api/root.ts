import {
  createCallerFactory,
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "../db";
import { bids, disputes } from "../db/schema";
import { z } from "zod";
import { asc, desc, eq } from "drizzle-orm";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  createDispute: publicProcedure.mutation(async () => {
    const dispute = await db.insert(disputes).values({}).returning().execute();
    console.log({ dispute });
    return dispute[0]!;
  }),
  getDispute: publicProcedure
    .input(z.object({ disputeId: z.number().int() }))
    .query(async ({ input }) => {
      const dispute = await db.query.disputes.findFirst({
        where: eq(disputes.id, input.disputeId),
        with: {
          bids: { orderBy: (bids, { desc }) => [desc(bids.id)] },
        },
      });
      return dispute;
    }),
  placeBid: publicProcedure
    .input(
      z.object({
        disputeId: z.number().int(),
        amount: z.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      const lastBid = await db.query.bids.findFirst({
        where: eq(bids.disputeId, input.disputeId),
        orderBy: [desc(bids.id)],
      });

      if (lastBid?.state === "settled") {
        throw new Error(
          "The bid cannot be placed because the dispute is already settled.",
        );
      }

      if (lastBid?.state === "pending") {
        await db
          .update(bids)
          .set({
            state: "voided",
            updatedAt: new Date(),
          })
          .where(eq(bids.id, lastBid.id))
          .execute();
      }

      const bid = await db
        .insert(bids)
        .values({
          disputeId: input.disputeId,
          amount: input.amount,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
        .execute();

      return bid[0]!;
    }),
  acceptBid: publicProcedure
    .input(z.object({ bidId: z.number().int() }))
    .mutation(async ({ input }) => {
      const bid = await db.query.bids.findFirst({
        where: eq(bids.id, input.bidId),
      });

      if (!bid) {
        throw new Error("Bid not found");
      }
      if (bid.state !== "pending") {
        throw new Error(
          "The bid cannot be accepted because it is not pending.",
        );
      }

      await db
        .update(bids)
        .set({
          state: "settled",
          updatedAt: new Date(),
        })
        .where(eq(bids.id, input.bidId))
        .execute();
    }),
  rejectBid: publicProcedure
    .input(z.object({ bidId: z.number().int() }))
    .mutation(async ({ input }) => {
      const bid = await db.query.bids.findFirst({
        where: eq(bids.id, input.bidId),
      });

      if (!bid) {
        throw new Error("Bid not found");
      }
      if (bid.state !== "pending") {
        throw new Error(
          "The bid cannot be rejected because it is not pending.",
        );
      }

      await db
        .update(bids)
        .set({
          state: "rejected",
          updatedAt: new Date(),
        })
        .where(eq(bids.id, input.bidId))
        .execute();
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
