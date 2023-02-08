import { ApolloServer, gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const client = new PrismaClient();

const getUser = (token) => {
  try {
    if (token) {
      return jwt.verify(token, process.env.SECRET_KEY);
    }
    return null;
  } catch (err) {
    return null;
  }
};

const typeDefs = gql`
  type Auth {
    token: String
    loginUser: User
  }

  type User {
    id: Int!
    user_name: String!
    email: String!
    password: String!
    nickname: String!
  }

  type Posting {
    id: Int
    title: String!
    text: String!
    img: String
    created: String
    user_id: Int
  }

  type Query {
    User: [User]
    AllPosting: [Posting!]!
    currentUser: User
  }

  type Mutation {
    signup(
      id: Int
      user_name: String!
      email: String!
      password: String!
      nickname: String!
    ): User

    login(email: String!, password: String!): Auth

    addPosting(
      title: String!
      id: Int
      text: String!
      created: String
      img: [String]
      user_id: Int
    ): Posting!

    deletePosting(id: Int!): Posting
  }
`;

const resolvers = {
  Query: {
    User: (_parent, _args) => {
      return client.User.findMany();
    },
    AllPosting: (_parent, _args, _ctx) => {
      return client.posting.findMany();
    },
    currentUser: (_parent, _args) => {
      if (!user) {
        throw new Error("유저정보가 없습니다.");
      }
      return client.User.findUnique({ where: { email: user.email } });
    },
  },
  Mutation: {
    signup: async (_parent, { email, password, nickname, user_name }, _ctx) => {
      const hashPassword = await bcrypt.hash(password, 12);
      await client.User.create({
        data: { email, nickname, user_name, password: hashPassword },
      });
    },
    login: async (_parent, { email, password }, _ctx) => {
      const loginUser = await client.User.findUnique({
        where: {
          email,
        },
      });
      if (!loginUser) {
        throw new Error("등록되지 않은 이메일입니다.");
      }
      const passwordMatch = await bcrypt.compare(password, loginUser.password);
      if (!passwordMatch) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }
      const token = jwt.sign(
        {
          email: loginUser.email,
          password: loginUser.password,
        },
        process.env.SECRET_KEY
      );
      return { token, loginUser };
    },
    addPosting: async (_parent, { title, text, img }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      const date = Date().toString();
      return client.Posting.create({
        data: {
          title,
          text,
          created: date,
          img: img || null,
          user_id: currentUser.id,
        },
      });
    },
    deletePosting: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("권한이 없습니다.");
      }
      const postInfo = await client.Posting.findUnique({ where: { id } });
      if (currentUser.id !== postInfo.user_id) {
        throw new Error("권한이 없습니다.");
      }
      await client.Posting.delete({ where: { id } });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const token = req.headers.authorization || "";
    const user = getUser(token);
    let currentUser;
    if (token !== "") {
      await client.User.findUnique({
        where: { email: user.email },
      });
      return currentUser;
    }
    return { user, currentUser };
  },
});

await server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
