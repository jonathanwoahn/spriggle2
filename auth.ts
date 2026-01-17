import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (user.length === 0) {
          return null;
        }

        const foundUser = user[0];
        const isValid = await bcrypt.compare(password, foundUser.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/sign-in',
  },
});

// Extend the built-in types
declare module 'next-auth' {
  interface User {
    role?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      role?: string | null;
    };
  }
}

