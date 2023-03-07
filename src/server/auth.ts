import { type GetServerSidePropsContext } from "next";
import { getServerSession, type Session } from "next-auth";
import { getAuthOptions } from "../pages/api/auth/[...nextauth]";

/**
 * Wrapper for unstable_getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return (await getServerSession(
    ctx.req,
    ctx.res,
    getAuthOptions(ctx.req)
  )) as Session | null;
};
