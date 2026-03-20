import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ensureConfiguredAdminAccount,
  isConfiguredAdminCredentials,
} from "@/lib/admin-auth";
import { db } from "@/lib/db";
import { getOptionalEnv } from "@/lib/env";
import { logError, logWarn } from "@/lib/logger";

const nextAuthSecret = getOptionalEnv("NEXTAUTH_SECRET");

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

let nextAuthDbFailureLogTimestamp = 0;
const AUTH_DB_LOG_THROTTLE_MS = 60 * 1000;

function logAuthDatabaseFailureThrottled(error: unknown) {
  const now = Date.now();
  if (now < nextAuthDbFailureLogTimestamp) return;

  nextAuthDbFailureLogTimestamp = now + AUTH_DB_LOG_THROTTLE_MS;
  logWarn("Admin authentication check could not reach database.", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

function mapAdminSessionUser(user: {
  id: string;
  email: string;
  name: string;
  role?: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  debug: process.env.NEXTAUTH_DEBUG === "true",
  logger: {
    error(code, metadata) {
      const safeMetadata =
        typeof metadata === "string"
          ? metadata
          : metadata instanceof Error
            ? metadata.message
            : metadata
              ? Object.prototype.toString.call(metadata)
              : undefined;

      logError("NextAuth error event.", {
        code,
        ...(safeMetadata ? { metadata: safeMetadata } : {}),
      });
    },
    warn(code) {
      logWarn("NextAuth warning event.", { code });
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const normalizedEmail = parsed.data.email.trim().toLowerCase();
        const normalizedPassword = parsed.data.password.trim();

        if (!normalizedEmail || !normalizedPassword) {
          return null;
        }

        try {
          const user = await db.adminUser.findUnique({
            where: { email: normalizedEmail },
          });

          if (user && user.active) {
            const validPassword = await bcrypt.compare(normalizedPassword, user.passwordHash);
            if (validPassword) {
              return mapAdminSessionUser({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              });
            }
          }

          if (isConfiguredAdminCredentials(normalizedEmail, normalizedPassword)) {
            const syncedAdmin = await ensureConfiguredAdminAccount(true);

            if (syncedAdmin && syncedAdmin.active && syncedAdmin.email === normalizedEmail) {
              return mapAdminSessionUser(syncedAdmin);
            }
          }

          return null;
        } catch (error) {
          logAuthDatabaseFailureThrottled(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const authUser = user as { id: string; role?: string };
        token.id = authUser.id;
        token.role = authUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id;
        session.user.role = token.role as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: nextAuthSecret,
};

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  return session;
}
