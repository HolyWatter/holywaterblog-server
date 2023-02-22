import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";

import jwt from "jsonwebtoken";
import typeDefs from "./typeDefs.js"
import resolvers from './resolvers.js'

const client = new PrismaClient();

const getCookieRefresh = (key, cookies) => {
  let matches = cookies.match(
    new RegExp(
      "(?:^|; )" +
        key.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
        "=([^;]*)"
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
};

const checkToken = (acessToken) => {
  try {
    if (acessToken) {
      const token = jwt.verify(acessToken, process.env.SECRET_KEY);
      return token;
    } else return null;
  } catch (err) {
    throw new Error(err.message);
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
  context: async ({ req, res }) => {
    const token = req.headers.authorization || "";
    const refresh = getCookieRefresh("refresh", req.headers.cookie);
    const user = checkToken(token);
    let currentUser;
    if (token) {
      currentUser = await client.User.findUnique({
        where: { email: user.email },
      });
    }
    return { user, currentUser, res, refresh };
  },
});

await server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
