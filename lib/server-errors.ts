import { Prisma } from "@prisma/client";

type MessageMap = {
  [code: string]: string;
};

const PRISMA_ERROR_MESSAGES: MessageMap = {
  P1001: "The database server is unreachable. Please try again shortly.",
  P1002: "The database server timed out. Please try again shortly.",
  P2002: "A record with the same unique value already exists.",
  P2003: "This item cannot be changed because it is still referenced by other data.",
  P2025: "The requested record no longer exists.",
};

export function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export function toUserFacingError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message === "Unauthorized") {
    return "Your session has expired. Please sign in again.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return PRISMA_ERROR_MESSAGES[error.code] || fallbackMessage;
  }

  return fallbackMessage;
}
