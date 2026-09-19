import "server-only";
import { Prisma } from "@/generated/prisma/client";

/** Postgres unique-constraint violation (Prisma's P2002). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * Runs an insert, turning "a unique constraint refused it" into `null` so the
 * caller can answer with a friendly message. Anything else still throws.
 */
export async function insertOrNull<T>(
  insert: () => Promise<T>,
): Promise<T | null> {
  try {
    return await insert();
  } catch (error) {
    if (isUniqueViolation(error)) return null;
    throw error;
  }
}
