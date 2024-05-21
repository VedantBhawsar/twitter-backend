import { Like } from '@prisma/client';
import { prismaClient } from '../../clients/db';
import { IGraphqlContext } from '../../interfaces';

interface ILikePayload {
  tweetId: string;
}

const mutations = {
  addLike: async (
    parent: any,
    { payload }: { payload: ILikePayload },
    ctx: IGraphqlContext
  ) => {
    if (!ctx.user?.id) throw new Error('You are not logged in');
    const alreadyLiked = await prismaClient.like.findFirst({
      where: {
        userId: ctx.user.id,
        tweetId: payload.tweetId,
      },
    });
    let message: String = '';
    if (alreadyLiked) {
      message = 'Like removed';
      await prismaClient.like.deleteMany({
        where: {
          userId: ctx.user.id,
          tweetId: payload.tweetId,
        },
      });
    } else {
      message = 'Like added';
      await prismaClient.like.create({
        data: {
          userId: ctx.user.id,
          tweetId: payload.tweetId,
        },  
      });
    }
    return message;
  },
  removeLike: async (
    parent: any,
    payload: ILikePayload,
    ctx: IGraphqlContext
  ) => {
    if (!ctx.user?.id) throw new Error('You are not logged in');
    const like = await prismaClient.like.deleteMany({
      where: {
        userId: ctx.user.id,
        tweetId: payload.tweetId,
      },
    });
    return like;
  },
};

export const extraResolvers = {
  Like: {
    author: async (parent: Like) =>
      prismaClient.user.findUnique({
        where: {
          id: parent.userId,
        },
      }),
  },
};

export const resolvers = {
  mutations,
  extraResolvers
};
