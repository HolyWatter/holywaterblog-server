import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import AWS from "aws-sdk";
import jwt from "jsonwebtoken";
import { gql } from "apollo-server";
import bcrypt from "bcrypt";

const client = new PrismaClient();

AWS.config.update({
  credentials: {
    accessKeyId: process.env.S3_ACCESSKEY,
    secretAccessKey: process.env.S3_SECRETKEY,
  },
});

const checkToken = (acessToken) => {
  try {
    if (acessToken) {
      const token = jwt.verify(acessToken, process.env.SECRET_KEY);
      return token;
    } else return null;
  } catch (err) {
    return null;
  }
};

const typeDefs = gql`
  scalar DateTime
  scalar Upload

  type Auth {
    acessToken: String
    loginUser: User
    message: String
  }

  type User {
    id: Int!
    user_name: String!
    thumbnail_url: String
    email: String!
    password: String!
    nickname: String!
    role: String!
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

  type MarkdownTag {
    id: Int
    tag: String
    markdownId: Int
  }

  type Posting {
    id: Int!
    title: String!
    text: String!
    img: [PostingImg]
    tag: [Tags]
    created: DateTime!
    user_id: Int!
    comments: [Comment]
    author: User!
  }

  type Markdown {
    id: Int!
    title: String!
    text: String!
    MarkdownImg: [PostingImg]
    MarkdownTag: [MarkdownTag]
    created: DateTime!
    user_id: Int!
    comments: [Comment]
    author: User!
  }

  type PostingImg {
    id: Int
    location: String
  }

  type Query {
    User: [User]
    AllPosting: [Posting!]!
    currentUser: User!
    allMarkdown: [Posting!]!
    markdownDetail(id: Int!): Markdown
  }

  type Mutation {
    signup(
      id: Int
      user_name: String!
      email: String!
      password: String!
      nickname: String!
      thumbnail: Upload
    ): User

    login(email: String!, password: String!): Auth

    addTags(tag: [String!]): [Tags]!

    addPosting(
      title: String!
      id: Int
      text: String!
      created: DateTime
      tag: [String]
      img: [Upload]
      user_id: Int
    ): Posting!

    addMarkdown(
      title: String!
      id: Int
      text: String!
      created: DateTime
      tag: [String]
      img: [Upload]
      user_id: Int
    ): Markdown!

    addPostingComment(text: String!, postingId: Int!, user_id: Int): Comment

    addMarkdownComment(text: String!, markdownId: Int!, user_id: Int): Comment

    deletePosting(id: Int!): Posting

    uploadTest(file: [Upload]!): Images
  }
  type Images {
    id: Int
    location: String
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
          MarkdownTag: true,
          MarkdownImg: true,
          comments: {
            include: {
              writer: true,
            },
          },
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
          img: true,
          tag: true,
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
    currentUser: async (_parent, _args, { currentUser }) => {
      if (currentUser) {
        return currentUser;
      } else {
        throw new Error("유저정보가 없습니다.");
      }
    },
  },
  Mutation: {
    signup: async (
      _parent,
      { email, password, nickname, user_name, thumbnail },
      _ctx
    ) => {
      const hashPassword = await bcrypt.hash(password, 12);
      const key = `${Date.now()}`;
      await new AWS.S3()
        .putObject({
          Body: Buffer.from(
            thumbnail.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          ),
          Bucket: "holywater-blog",
          Key: key,
          ACL: "public-read",
        })
        .promise();

      await client.User.create({
        data: {
          email,
          nickname,
          user_name,
          password: hashPassword,
          thumbnail_url: `https://holywater-blog.s3.ap-northeast-1.amazonaws.com/${key}`,
        },
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
      const acessToken = jwt.sign(
        {
          email: loginUser.email,
          password: loginUser.password,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      const message = "로그인되었습니다.";
      const refreshToken = jwt.sign({}, process.env.SECRET_KEY, {
        expiresIn: "14d",
      });
      await client.User.update({
        where: {
          email,
        },
        data: {
          refreshToken,
        },
      });
      return { acessToken, loginUser, refreshToken, message };
    },
    addPosting: async (_, { title, text, img, tag }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      let posting = await client.Posting.create({
        data: {
          title,
          text,
          created: new Date(),
          user_id: currentUser.id,
        },
      });
      img?.map(async (element) => {
        const key = `${Date.now()}`;
        await new AWS.S3()
          .putObject({
            Body: Buffer.from(
              element.replace(/^data:image\/\w+;base64,/, ""),
              "base64"
            ),
            Bucket: "holywater-blog",
            Key: key,
            ACL: "public-read",
          })
          .promise();
        await client.PostingImg.create({
          data: {
            postingId: posting.id,
            location: `https://holywater-blog.s3.ap-northeast-1.amazonaws.com/${key}`,
          },
        });
      });
      tag.map(
        async (item) =>
          await client.postingTags.create({
            data: {
              tag: item,
              postingId: posting.id,
            },
          })
      );
      return posting;
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
    addMarkdown: async (
      _parent,
      { title, text, tag, img },
      { currentUser }
    ) => {
      if (!currentUser) {
        throw new Error("유저정보가 없습니다.");
      }
      const markdown = await client.Markdown.create({
        data: {
          title,
          text,
          created: new Date(),
          user_id: currentUser.id,
        },
      });
      img?.map(async (element) => {
        const key = `${Date.now()}`;
        await new AWS.S3()
          .putObject({
            Body: Buffer.from(
              element.replace(/^data:image\/\w+;base64,/, ""),
              "base64"
            ),
            Bucket: "holywater-blog",
            Key: key,
            ACL: "public-read",
          })
          .promise();
        await client.MarkdownImg.create({
          data: {
            MarkdownId: markdown.id,
            location: `https://holywater-blog.s3.ap-northeast-1.amazonaws.com/${key}`,
          },
        });
      });
      tag.map(
        async (item) =>
          await client.MarkdownTag.create({
            data: {
              tag: item,
              markdownId: markdown.id,
            },
          })
      );
      return markdown;
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
    const user = checkToken(token);
    let currentUser;
    if (token) {
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
