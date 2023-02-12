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
  scalar DateTime
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

  type Comment {
    id: Int
    text: String!
    postingId: Int!
    user_id: Int
    writer: User
  }

  type Tags {
    id: Int
    tag: String!
    postingId: Int
  }

  type Posting {
    id: Int!
    title: String!
    text: String!
    img: [String]
    tag: [Tags]
    created: DateTime!
    user_id: Int!
    comments: [Comment]
    author: User!
  }

  type Query {
    User: [User]
    AllPosting: [Posting!]!
    currentUser: User
    allMarkdown: [Posting!]!
    markdownDetail(id: Int!): Posting
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

    addTags(tag: [String!]): [Tags]!

    addPosting(
      title: String!
      id: Int
      text: String!
      created: DateTime
      tag: [String]
      img: [String]
      user_id: Int
    ): Posting!

    addMarkdown(
      title: String!
      id: Int
      text: String!
      created: DateTime
      tag: [String]
      img: [String]
      user_id: Int
    ): Posting!

    addPostingComment(text: String!, postingId: Int!, user_id: Int): Comment

    addMarkdownComment(text: String!, markdownId: Int!, user_id: Int): Comment

    deletePosting(id: Int!): Posting
  }
`;

const resolvers = {
  Query: {
    User: (_parent, _args) => {
      return client.User.findMany();
    },
    markdownDetail: (_parent, { id }, _ctx) => {
      return client.Markdown.findUnique({
        where: {
          id: id,
        },
        include: {
          author: true,
          comments: true,
        },
      });
    },
    allMarkdown: () => {
      return client.Markdown.findMany({
        include: {
          author: true,
          comments: true,
        },
        orderBy: {
          created: "desc",
        },
      });
    },
    AllPosting: (_parent, _args, _ctx) => {
      return client.posting.findMany({
        include: {
          author: true,
          comments: {
            select: {
              id: true,
              text: true,
              writer: true,
            },
          },
        },
        orderBy: {
          created: "desc",
        },
      });
    },
    currentUser: async (_parent, _args, { user }) => {
      if (!user) {
        throw new Error("유저정보가 없습니다.");
      }
      return await client.User.findUnique({ where: { email: user.email } });
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
      } else {
        const passwordMatch = await bcrypt.compare(
          password,
          loginUser.password
        );
        if (!passwordMatch) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }
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
    addPosting: async (_, { title, text, img, tag }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      const date = new Date();
      let posting = await client.Posting.create({
        data: {
          title,
          text,
          created: date,
          img: img || null,
          user_id: currentUser.id,
        },
      });
      return posting;
    },
    addTags: async (_, { tag, id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      let tags = await tag.map((item) =>
        client.Tags.create({ data: { tag: item, postingId: id } })
      );
      return tags;
    },
    addPostingComment: async (
      _parent,
      { text, postingId },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      return client.PostingComment.create({
        data: {
          text,
          postingId,
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
    addMarkdown: (_parent, { title, text }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      const date = new Date();
      return client.Markdown.create({
        data: {
          title,
          text,
          created: date,
          user_id: currentUser.id,
        },
      });
    },
    addMarkdownComment: async (
      _parent,
      { text, markdownId },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      return client.MarkdownComment.create({
        data: {
          text,
          markdownId,
          user_id: currentUser.id,
        },
      });
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
      currentUser = await client.User.findUnique({
        where: { email: user.email },
      });
    }
    return { user, currentUser };
  },
});

await server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
