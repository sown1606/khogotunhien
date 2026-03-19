import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getSiteUrl } from "@/lib/env";
import { logError } from "@/lib/logger";

const authHandler = NextAuth(authOptions);
const LOGIN_ERROR_URL = "/admin/login?error=AuthServerError";

function getSafeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return message.length > 400 ? `${message.slice(0, 400)}…` : message;
}

function isCredentialsCallback(request: Request) {
  const url = new URL(request.url);
  return request.method === "POST" && url.pathname.endsWith("/api/auth/callback/credentials");
}

type AuthRouteContext = {
  params: Promise<{
    nextauth: string[];
  }>;
};

async function safeAuthHandler(request: Request, context: AuthRouteContext) {
  try {
    return await authHandler(request, context);
  } catch (error) {
    logError("NextAuth route failed unexpectedly.", {
      method: request.method,
      path: new URL(request.url).pathname,
      error: getSafeError(error),
    });

    if (isCredentialsCallback(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: "AuthServerError",
          url: LOGIN_ERROR_URL,
        },
        { status: 200 },
      );
    }

    const fallbackUrl = new URL(LOGIN_ERROR_URL, getSiteUrl());
    return NextResponse.redirect(fallbackUrl, { status: 302 });
  }
}

export { safeAuthHandler as GET, safeAuthHandler as POST };
