import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, bookings, InsertBooking, partners, InsertPartner, pricing, InsertPricing, payments, InsertPayment, subscriptions, InsertSubscription } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Booking queries
export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(bookings).where(eq(bookings.userId, userId));
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(bookings);
}

export async function updateBookingStatus(bookingId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(bookings).set({ status: status as any }).where(eq(bookings.id, bookingId));
}

// Partner queries
export async function createPartner(partner: InsertPartner) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(partners).values(partner);
}

export async function getPartnerByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(partners).where(eq(partners.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllPartners() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(partners);
}

export async function updatePartnerStatus(partnerId: number, status: string, verificationStatus?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { status: status as any };
  if (verificationStatus) updateData.verificationStatus = verificationStatus as any;
  return db.update(partners).set(updateData).where(eq(partners.id, partnerId));
}

// Pricing queries
export async function getAllPricing() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(pricing).where(eq(pricing.active, 1));
}

export async function updatePricing(categoryId: number, minPrice: number, maxPrice: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(pricing).set({ minPrice, maxPrice }).where(eq(pricing.id, categoryId));
}

export async function createPricing(pricingData: InsertPricing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(pricing).values(pricingData);
}

// Payment queries
export async function createPayment(payment: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(payments).values(payment);
}

export async function getPaymentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(payments).where(eq(payments.userId, userId));
}

// Subscription queries
export async function createSubscription(subscription: InsertSubscription) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(subscriptions).values(subscription);
}

export async function getSubscriptionByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSubscriptionStatus(subscriptionId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(subscriptions).set({ status: status as any }).where(eq(subscriptions.id, subscriptionId));
}
