import { gql } from "apollo-server";

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
    GuestBook: [GuestBook]
    Comment: [PostingComment]
    MarkdownComment: [MarkdownComment]
    markdown: [Markdown]
    posts: [Posting]
  }

  type GuestBook {
    id: Int
    user_id: Int
    text: String!
    created: DateTime
    writer: User
  }

  type PostingComment {
    id: Int
    text: String!
    postingId: Int!
    user_id: Int
    writer: User
  }

  type MarkdownComment {
    id: Int
    text: String!
    markdownId: Int!
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
    comments: [PostingComment]
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
    comments: [MarkdownComment]
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
    allGuestBook: [GuestBook]
    myPage: User
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
    writeGuestBook(text: String, user_id: Int): GuestBook
    login(email: String!, password: String!): Auth
    addTags(tag: [String!]): [Tags]!
    modifyProfileImg(img: Upload): User
    deleteUserInfo(email: String!): User
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

    addPostingComment(
      text: String!
      postingId: Int!
      user_id: Int
    ): PostingComment

    addMarkdownComment(
      text: String!
      markdownId: Int!
      user_id: Int
    ): MarkdownComment

    deletePosting(id: Int!): Posting

    uploadTest(file: [Upload]!): Images
  }
  type Images {
    id: Int
    location: String
  }
`;

export default typeDefs;
