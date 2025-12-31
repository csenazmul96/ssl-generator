import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { findUserByEmail, saveUser } from "@/lib/userStore";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await findUserByEmail(credentials.email);

                // Note: In production use bcrypt.compare
                if (user && user.password === credentials.password) {
                    return { id: user.id, name: user.name, email: user.email, image: user.image };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                // Check if user exists, if not register them silently
                const existing = await findUserByEmail(user.email!);
                if (!existing) {
                    try {
                        await saveUser({
                            id: user.id,
                            name: user.name,
                            email: user.email!,
                            image: user.image,
                            provider: 'google'
                        });
                    } catch (e) {
                        // ignore if race condition
                    }
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                // @ts-ignore
                session.user.id = token.sub;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
};
