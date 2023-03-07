/* eslint-disable */ // --> OFF eslint
// Code in this file is based on https://docs.login.xyz/integrations/nextauth.js
// with added process.env.VERCEL_URL detection to support preview deployments
// and with auth option logic extracted into a 'getAuthOptions' function so it
// can be used to get the session server-side with 'unstable_getServerSession'
import { IncomingMessage } from "http";
import { type NextApiRequest, type NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

/**
 *
 * NOTE: credential provider DOES NOT SUPPORT DB PERSISTANCE
 * ref: https://stackoverflow.com/questions/70474736/nextauth-credential-provider-with-prisma-adapter-in-next12-does-nothing/70480056#70480056
 */

export function getAuthOptions(req: IncomingMessage): NextAuthOptions {
  const providers = [
    CredentialsProvider({
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );

          const nextAuthUrl =
            process.env.NEXTAUTH_URL ||
            (process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : null);

          //   if (process.env.NODE_ENV === "development") {
          //     console.log("dev", process.env.NODE_ENV);
          //   } else {
          //     console.log("not dev", process.env.NODE_ENV);
          //   }
          //   console.log("NEXTAUTH URL:", process.env.NEXTAUTH_URL);
          //   console.log("NEXTAUTH URL:", nextAuthUrl);
          if (!nextAuthUrl) {
            return null;
          }

          const nextAuthHost = new URL(nextAuthUrl).host;
          if (siwe.domain !== nextAuthHost) {
            return null;
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null;
          }

          await siwe.validate(credentials?.signature || "");
          return {
            id: siwe.address,
          };
        } catch (e) {
          return null;
        }
      },
      credentials: {
        message: {
          label: "Message",
          placeholder: "0x0",
          type: "text",
        },
        signature: {
          label: "Signature",
          placeholder: "0x0",
          type: "text",
        },
      },
      name: "Ethereum",
    }),
  ];

  return {
    callbacks: {
      async session({ session, token }) {
        // session.address = token.sub;
        // session.user = {
        //   name: token.sub,
        // };

        session.user = {
          name: token.sub,
          address: token.sub,
        };
        return session;
      },
    },
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    secret: process.env.NEXTAUTH_SECRET as string,
    session: {
      strategy: "jwt",
    },
  };
}

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const authOptions = getAuthOptions(req);

  if (!Array.isArray(req.query.nextauth)) {
    res.status(400).send("Bad request");
    return;
  }

  const isDefaultSigninPage =
    req.method === "GET" &&
    req.query.nextauth.find((value) => value === "signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    authOptions.providers.pop();
  }

  return await NextAuth(req, res, authOptions);
}

// import NextAuth, { type NextAuthOptions } from "next-auth";
// import DiscordProvider from "next-auth/providers/discord";
// // Prisma adapter for NextAuth, optional and can be removed
// import { PrismaAdapter } from "@next-auth/prisma-adapter";

// import { env } from "../../../env/server.mjs";
// import { prisma } from "../../../server/db";

// export const authOptions: NextAuthOptions = {
//   // Include user.id on session
//   callbacks: {
//     session({ session, user }) {
//       if (session.user) {
//         session.user.id = user.id;
//       }
//       return session;
//     },
//   },
//   // Configure one or more authentication providers
//   adapter: PrismaAdapter(prisma),
//   providers: [
//     DiscordProvider({
//       clientId: env.DISCORD_CLIENT_ID,
//       clientSecret: env.DISCORD_CLIENT_SECRET,
//     }),
//     /**
//      * ...add more providers here
//      *
//      * Most other providers require a bit more work than the Discord provider.
//      * For example, the GitHub provider requires you to add the
//      * `refresh_token_expires_in` field to the Account model. Refer to the
//      * NextAuth.js docs for the provider you want to use. Example:
//      * @see https://next-auth.js.org/providers/github
//      */
//   ],
// };

// export default NextAuth(authOptions);
