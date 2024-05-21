import axios from 'axios';
import { prismaClient } from '../../clients/db';
import { IGraphqlContext } from '../../interfaces';
import { Comment } from '@prisma/client';

interface ICreateCommentPayload {
  content: string;
  tweetId: string;
}

const queries = {
  getComments: async (parent: any, payload: { tweetId: string }) =>
    prismaClient.comment.findMany({
      where: {
        tweetId: payload.tweetId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
};

const mutations = {
  createComment: async (
    parent: any,
    { payload }: { payload: ICreateCommentPayload },
    ctx: IGraphqlContext
  ) => {
    if (!ctx.user?.id) throw new Error('You are not logged in');
    const comment = await prismaClient.comment.create({
      data: {
        content: payload.content,
        author: { connect: { id: ctx.user.id } },
        tweet: { connect: { id: payload.tweetId } },
      },
    });
    return comment;
  },
};

const extraResolvers = {
  Comment: {
    author: (parent: Comment) =>
      prismaClient.user.findUnique({ where: { id: parent.authorId } }),
    tweet: (parent: Comment) =>
      prismaClient.tweet.findUnique({
        where: { id: parent.tweetId },
      }),
  },
};

export const resolvers = {
  mutations,
  queries,
  extraResolvers,
};
