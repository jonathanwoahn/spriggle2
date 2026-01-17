"use server";

import { signIn, signOut } from "@/auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { listFiles } from "@/lib/storage";
import { redirect } from "next/navigation";
import Cashmere from "@/lib/cashmere";
import { getServerURL } from "@/lib/utils";
import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";

export const signUpAction = async (formData: FormData, redirect_to?: string) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirect(`/sign-up?error=${encodeURIComponent("Email and password are required")}`);
  }

  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return redirect(`/sign-up?error=${encodeURIComponent("User already exists")}`);
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if this is the first user - make them admin
    const allUsers = await db.select().from(users).limit(1);
    const isFirstUser = allUsers.length === 0;

    await db.insert(users).values({
      id: uuid(),
      email,
      passwordHash,
      role: isFirstUser ? 'admin' : 'user',
      emailVerified: new Date(), // Auto-verify for now
    });

    // Sign in the user
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirect_to || "/",
    });
  } catch (error: any) {
    // Handle redirect from signIn
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Sign up error:", error);
    return redirect(`/sign-up?error=${encodeURIComponent(error.message || "Sign up failed")}`);
  }
};

export const signInAction = async (formData: FormData, redirect_to?: string) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirect_to || "/",
    });
  } catch (error: any) {
    // Handle redirect from signIn
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error;
    }
    return redirect(`/sign-in?error=${encodeURIComponent("Invalid credentials")}&redirect_to=${redirect_to || ""}`);
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();

  if (!email) {
    return redirect(`/forgot-password?error=${encodeURIComponent("Email is required")}`);
  }

  // For now, just show a success message
  // TODO: Implement email sending for password reset
  return redirect(`/forgot-password?success=${encodeURIComponent("If an account exists with that email, you will receive a password reset link.")}`);
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const token = formData.get("token") as string;

  if (!password || !confirmPassword) {
    return redirect(`/reset-password?error=${encodeURIComponent("Password and confirm password are required")}`);
  }

  if (password !== confirmPassword) {
    return redirect(`/reset-password?error=${encodeURIComponent("Passwords do not match")}`);
  }

  // TODO: Implement password reset with token verification
  return redirect(`/sign-in?success=${encodeURIComponent("Password updated successfully")}`);
};

export const signOutAction = async () => {
  await signOut({ redirectTo: "/" });
};

export interface ISetting {
  description: string;
  field: string;
  id: number;
  key: string;
  type: 'string' | 'boolean';
  value: string;
  order: number;
}

export const saveSettings = async (settings: ISetting[]) => {
  await fetch(`${getServerURL()}/api/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  })
}

export const getJobCount = async ({ bookId }: { bookId: string }) => {
  // Use Drizzle for database queries
  const { db: database } = await import("@/db");
  const { omnipubs, ingestionStatus } = await import("@/db/schema");
  const { eq, sql } = await import("drizzle-orm");

  // Get ingestion progress from ingestionStatus table
  const ingestionStats = await database
    .select()
    .from(ingestionStatus)
    .where(eq(ingestionStatus.bookId, bookId))
    .limit(1);

  const totalSections = ingestionStats[0]?.totalSections || 0;
  const completedSections = ingestionStats[0]?.completedSections || 0;
  const ingestionStatusValue = ingestionStats[0]?.status || 'pending';

  // Get book stats from omnipubs
  const bookStats = await database
    .select({
      hasSummary: sql<boolean>`${omnipubs.summary} is not null`,
      hasEmbedding: sql<boolean>`${omnipubs.embedding} is not null`,
      totalDuration: omnipubs.totalDuration,
    })
    .from(omnipubs)
    .where(eq(omnipubs.uuid, bookId))
    .limit(1);

  // List audio files from R2 - count actual section audio files
  const audioFiles = await listFiles(`${bookId}/`);
  // Audio files are stored as: ${bookId}/${voiceId}/section-${order}.mp3
  const audioCount = audioFiles.filter((file) =>
    file.key?.match(/section-\d+\.mp3$/)
  ).length;

  return {
    // Progress tracking
    totalSections,
    completedSections,
    ingestionStatus: ingestionStatusValue,

    // Legacy fields for compatibility
    totalJobs: totalSections,
    completedJobs: completedSections,
    metadataBlocks: 0, // Deprecated
    coreBlocks: 0, // Deprecated

    // Actual metrics
    duration: Number(bookStats[0]?.totalDuration || 0),
    hasSummary: bookStats[0]?.hasSummary || false,
    hasEmbedding: bookStats[0]?.hasEmbedding || false,
    audioCount,
    sections: totalSections,
  };
}
