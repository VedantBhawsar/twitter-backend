import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import bodyParser from 'body-parser';
import { User } from './user';
import { Tweet } from './tweet';
import { Comment } from './comment';
import JWTService from '../services/jwt';
import { IGraphqlContext } from '../interfaces';
import { Like } from './like';

async function initServer() {
  const app = express();
  app.use(bodyParser.json());

  const graphqlServer = new ApolloServer<IGraphqlContext>({
    typeDefs: `#graphql
    ${User.types}
    ${Tweet.types}
    ${Comment.types}
          ${Like.types}
    type Query {
      ${User.queries}
      ${Tweet.queries}
      ${Comment.queries}
    }
    type Mutation{
      ${User.mutations}
      ${Tweet.mutations}
      ${Comment.mutations}
      ${Like.mutations}
    }
    `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
        ...Tweet.resolvers.queries,
        ...Comment.resolvers.queries,
      },
      Mutation: {
        ...User.resolvers.mutations,
        ...Tweet.resolvers.mutations,
        ...Comment.resolvers.mutations,
        ...Like.resolvers.mutations,
      },
      ...Tweet.resolvers.extraResolvers,
      ...User.resolvers.extraResolvers,
      ...Comment.resolvers.extraResolvers,
      ...Like.resolvers.extraResolvers,
    },
  });

  await graphqlServer.start();

  app.use(
    '/graphql',
    cors({
      origin: 'https://twitter-clone-three-omega-20.vercel.app', // Replace with your frontend origin
      credentials: true, // Allow cookies for authentication (if applicable)
    }),
    express.json(),
    expressMiddleware(graphqlServer, {
      context: async ({ req, res }) => {
        return {
          user: req.headers.authorization
            ? JWTService.decodeToken(req.headers.authorization.split(' ')[1])
            : req.headers.authorization,
        };
      },
    })
  );

  return app;
}

export { initServer };
