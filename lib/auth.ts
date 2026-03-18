import { type NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { getOptionalEnv, validateAuthEnvironment } from "@/lib/env";

validateAuthEnvironment();

const nextAuthSecret = getOptionalEnv("NEXTAUTH_SECRET");

const credentialsSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
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

        const user = await db.adminUser.findUnique({
          where: { email: parsed.data.email },
        });

        if (!user || !user.active) {
          return null;
        }

        const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
