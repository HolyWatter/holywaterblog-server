import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import AWS from "aws-sdk";
import bcrypt from "bcrypt";

const client = new PrismaClient();
AWS.config.update({
  credentials: {
    accessKeyId: process.env.S3_ACCESSKEY,
    secretAccessKey: process.env.S3_SECRETKEY,
  },
});

const resolvers = {
  Query: {
    reAuth: (_parent, _, { refresh }) => {
      const isValid = jwt.verify(refresh, process.env.SECRET_KEY);
      if (!isValid) {
        throw new Error("asdf");
      } else {
        const acessToken = jwt.sign(
          {
            email: isValid.email,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "2h",
          }
        );
        return { acessToken };
      }
    },
    myPage: (_parent, _arg, { currentUser }) => {
      return client.User.findUnique({
        where: {
          id: currentUser.id,
        },
        include: {
          Comment: true,
          MarkdownComment: true,
          GuestBook: true,
          markdown: true,
          posts: true,
        },
      });
    },
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
    allGuestBook: (_parent, _args, _ctx) => {
      return client.GuestBook.findMany({
        include: {
          writer: true,
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
    deletePosting: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.Posting.findUnique({
        where: { id },
        include: { author: true },
      });
      if (writer.author.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return await client.Posting.delete({ where: { id } });
      }
    },
    deleteMarkdown: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.Markdown.findUnique({
        where: { id },
        include: { author: true },
      });
      if (writer.author.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return await client.Markdown.delete({ where: { id } });
      }
    },
    modifyPostingComment: async (_parent, { id, text }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.PostingComment.findUnique({
        where: { id },
        include: {
          writer: true,
        },
      });
      if (writer.writer.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return await client.PostingComment.update({
          where: { id },
          data: {
            text,
          },
        });
      }
    },
    deletePostingComment: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.PostingComment.findUnique({
        where: { id },
        include: {
          writer: true,
        },
      });
      if (writer.writer.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return await client.PostingComment.delete({ where: { id } });
      }
    },
    modifyMarkdownComment: async (_parent, { id, text }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.MarkdownComment.findUnique({
        where: { id },
        include: {
          writer: true,
        },
      });
      if (writer.writer.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else
        return client.MarkdownComment.update({
          where: { id },
          data: {
            text,
          },
        });
    },
    deleteMarkdownComment: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.MarkdownComment.findUnique({
        where: { id },
        include: {
          writer: true,
        },
      });
      if (writer.writer.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else
        return client.MarkdownComment.delete({
          where: { id },
        });
    },
    modifyGuestBook: async (_parent, { id, text }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.GuestBook.findUnique({
        where: { id },
        include: { writer: true },
      });
      if (writer.writer.id !== currentUser.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return client.GuestBook.update({
          where: { id },
          data: {
            text,
          },
        });
      }
    },
    deleteGuestBook: async (_parent, { id }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("접근 권한이 없습니다.");
      }
      const writer = await client.GuestBook.findUnique({
        where: { id },
        include: {
          writer: true,
        },
      });
      if (currentUser.id !== writer.writer.id) {
        throw new Error("접근 권한이 없습니다.");
      } else {
        return client.GuestBook.delete({ where: { id } });
      }
    },
    deleteUserInfo: async (_parent, { email }, { currentUser }) => {
      if (currentUser.email !== email) {
        throw new Error("입력하신 정보가 맞지 않습니다.");
      }
      if (currentUser.email === email) {
        await client.User.delete({ where: { id: currentUser.id } });
      }
    },
    modifyProfileImg: async (_parent, { img }, { currentUser }) => {
      const key = `${Date.now()}`;
      await new AWS.S3()
        .putObject({
          Body: Buffer.from(
            img.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
          ),
          Bucket: "holywater-blog",
          Key: key,
          ACL: "public-read",
        })
        .promise();
      await client.User.update({
        where: { id: currentUser.id },
        data: {
          thumbnail_url: `https://holywater-blog.s3.ap-northeast-1.amazonaws.com/${key}`,
        },
      });
    },
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
    login: async (_parent, { email, password }, { res }) => {
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
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      const refreshToken = jwt.sign(
        { email: loginUser.email },
        process.env.SECRET_KEY,
        {
          expiresIn: "14d",
        }
      );
      //7일
      let expireDate = new Date(Date.now() + 60 * 60 * 1000 * 24 * 7);
      res.cookie("refresh", refreshToken, {
        secure: true,
        httpOnly: true,
        expires: expireDate,
      });

      const message = "로그인되었습니다.";
      return { acessToken, loginUser, message };
    },
    writeGuestBook: async (_parent, { text }, { currentUser }) => {
      if (!currentUser) {
        throw new Error("유저 정보가 없습니다.");
      }
      const guestBook = await client.GuestBook.create({
        data: {
          text,
          user_id: currentUser.id,
          created: new Date(),
        },
      });
      return guestBook;
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

export default resolvers;
