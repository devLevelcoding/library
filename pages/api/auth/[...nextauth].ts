import bcrypt from "bcrypt"
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"

import prismadb from "@/lib/prismadb"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prismadb),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'text' },
        password: { label: 'password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prismadb.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user?.hashedPassword) {
          throw new Error('Invalid credentials');
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          throw new Error('Invalid credentials');
        }

        return user;
      },
    })
  ],
  pages: {
    signIn: '/',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
        if (token) {
            /* @ts-ignore */
            session.user.id = token.id;
            /* @ts-ignore */
            session.user.name = token.name
            /* @ts-ignore */
            session.user.email = token.email
            /* @ts-ignore */
            session.user.image = token.picture
            /* @ts-ignore */
            session.user.username = token.username
            /* @ts-ignore */
            session.user.role = token.role
        }

        return session;
    },
    async jwt({token, user}) {
        const dbUser = await prismadb.user.findFirst({
            where: {
                email: token.email,
            }
        })

        if (!dbUser) {
            token.id = user!.id
            return token;
        }

        return dbUser;
    },
    redirect({ baseUrl}) {
        return baseUrl
    }
  }
}

export default NextAuth({
    ...authOptions,
});