import { ApolloServer, gql } from "apollo-server";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

const typeDefs = gql`
  type User {
    id: Int!
    user_name: String!
  }
  type Query {
    User: [User]
  }

  type Mutation {
    addUser(user_name: String): User
    editUser(id: Int!, user_name: String): User
    deleteUser(id: Int!): User
  }
`;

const resolvers = {
  Query: {
    User: (_parent, _args, _context) => {
      return client.User.findMany();
    },
  },
  Mutation: {
    addUser: (_parent, { user_name }, _context) => {
      return client.User.create({ data: { user_name } });
    },
    editUser: (_parent, { id, user_name }, _context) => {
      return client.User.update({ where: { id }, data: { user_name } });
    },
    deleteUser: (_parent, { id }, _context) => {
      return client.User.delete({
        where: { id },
      });
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});
