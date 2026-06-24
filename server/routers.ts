import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createBooking, getBookingsByUserId, getAllBookings, updateBookingStatus, createPartner, getPartnerByUserId, getAllPartners, updatePartnerStatus, getAllPricing, updatePricing, createPayment, getPaymentsByUserId, createSubscription, getSubscriptionByUserId } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
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

  bookings: router({
    create: protectedProcedure
      .input(z.object({
        customerName: z.string(),
        phone: z.string(),
        address: z.string(),
        ward: z.string().optional(),
        scrapType: z.string(),
        weight: z.number().optional(),
        preferredTime: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await createBooking({
          userId: ctx.user.id,
          customerName: input.customerName,
          phone: input.phone,
          address: input.address,
          ward: input.ward,
          scrapType: input.scrapType,
          weight: input.weight,
          preferredTime: input.preferredTime,
          notes: input.notes,
          status: "pending",
        });
        await notifyOwner({
          title: "New Booking Request",
          content: `${input.customerName} has requested a scrap pickup for ${input.scrapType}. Phone: ${input.phone}`,
        });
        return booking;
      }),
    list: protectedProcedure.query(({ ctx }) => getBookingsByUserId(ctx.user.id)),
    listAll: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllBookings()),
    updateStatus: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ bookingId: z.number(), status: z.string() }))
      .mutation(({ input }) => updateBookingStatus(input.bookingId, input.status)),
  }),

  partners: router({
    register: protectedProcedure
      .input(z.object({
        shopName: z.string(),
        ownerName: z.string(),
        phone: z.string(),
        coveredAreas: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const partner = await createPartner({
          userId: ctx.user.id,
          shopName: input.shopName,
          ownerName: input.ownerName,
          phone: input.phone,
          coveredAreas: input.coveredAreas,
          status: "pending",
          verificationStatus: "unverified",
        });
        await notifyOwner({
          title: "New Partner Application",
          content: `${input.ownerName} from ${input.shopName} has applied to be a kabadi partner. Phone: ${input.phone}`,
        });
        return partner;
      }),
    getProfile: protectedProcedure.query(({ ctx }) => getPartnerByUserId(ctx.user.id)),
    listAll: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(() => getAllPartners()),
    updateStatus: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ partnerId: z.number(), status: z.string(), verificationStatus: z.string().optional() }))
      .mutation(({ input }) => updatePartnerStatus(input.partnerId, input.status, input.verificationStatus)),
  }),

  pricing: router({
    list: publicProcedure.query(() => getAllPricing()),
    update: protectedProcedure
      .use(async ({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .input(z.object({ categoryId: z.number(), minPrice: z.number(), maxPrice: z.number() }))
      .mutation(({ input }) => updatePricing(input.categoryId, input.minPrice, input.maxPrice)),
  }),

  payments: router({
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number().optional(),
        amount: z.number(),
        paymentType: z.enum(["express_pickup", "subscription", "booking_fee"]),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createPayment({
          userId: ctx.user.id,
          bookingId: input.bookingId,
          amount: input.amount,
          paymentType: input.paymentType,
          description: input.description,
          status: "pending",
        });
      }),
    list: protectedProcedure.query(({ ctx }) => getPaymentsByUserId(ctx.user.id)),
  }),

  subscriptions: router({
    create: protectedProcedure
      .input(z.object({
        plan: z.enum(["basic", "professional", "enterprise"]),
        frequency: z.enum(["weekly", "biweekly", "monthly"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return createSubscription({
          userId: ctx.user.id,
          plan: input.plan,
          frequency: input.frequency,
          status: "active",
        });
      }),
    get: protectedProcedure.query(({ ctx }) => getSubscriptionByUserId(ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
