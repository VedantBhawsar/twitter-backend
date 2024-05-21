import axios from 'axios';
import { prismaClient } from '../../clients/db';
import { IGraphqlContext } from '../../interfaces';
import { Tweet } from '@prisma/client';

interface TweetPayload {
  content: string;
  imageUrl?: string;
}
interface ITweetPayload {
  tweetId: string;
}

const queries = {
  getAllTweets: async () =>
    prismaClient.tweet.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }),
  getTweet: async (parent: any, payload: ITweetPayload) => {
    return await prismaClient.tweet.findUnique({
      where: {
        id: payload.tweetId,
      },
    });
  },
};

const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: TweetPayload },
    ctx: IGraphqlContext
  ) => {
    if (!ctx.user?.id) throw new Error('You are not logged in');
    const tweet = await prismaClient.tweet.create({
      data: {
        content: payload.content,
        imageUrl: payload.imageUrl,
        author: { connect: { id: ctx.user.id } },
      },
    });
    return tweet;
  },
};

const extraResolvers = {
  Tweet: {
    author: (parent: Tweet) =>
      prismaClient.user.findUnique({
        where: { id: parent.authorId },
      }),
    comments: (parent: Tweet) =>
      prismaClient.comment.findMany({
        where: {
          tweetId: parent.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),

    like: (parent: Tweet) =>
      prismaClient.like.findMany({
        where: {
          tweetId: parent.id,
        },
      }),
  },
};

export const resolvers = {
  mutations,
  extraResolvers,
  queries,
};
