import axios from "axios";
import { prismaClient } from "../../clients/db";
import JWTService from "../../services/jwt";
import { IGraphqlContext } from "../../interfaces";
import { Tweet, User } from "@prisma/client";

interface IGoogleTokenData {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: string;
  nbf: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: string;
  exp: string;
  jti: string;
  alg: string;
  kid: string;
  typ: string;
}

interface IFollowPayload {
  userId: string;
}

const queries = {
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const googleAuthToken = token;

    let authUrl = new URL("https://oauth2.googleapis.com/tokeninfo?id_token=");
    authUrl.searchParams.set("id_token", token);

    const { data } = await axios.get<IGoogleTokenData>(authUrl.toString(), {
      responseType: "json",
    });

    let user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      user = await prismaClient.user.create({
        data: {
          firstName: data.given_name,
          lastName: data.family_name,
          email: data.email,
          profileImageUrl: data.picture,
        },
      });
    }
    token = JWTService.generateTokenForUser(user);
    return token;
  },
  getCurrentUser: async (parent: any, arg: any, ctx: IGraphqlContext) => {
    const id = ctx.user?.id;
    if (!id) return null;

    const user = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });
    return user;
  },
  getUser: async (parent: any, { userId }: { userId: string }) =>
    prismaClient.user.findUnique({ where: { id: userId } }),
  getRecommendations: async (parent: any, arg: any, ctx: IGraphqlContext) => {
    
    const followedByFollowings = await prismaClient.follow.findMany({
      where: {
        followerId: {
          in: await prismaClient.follow
            .findMany({
              where: { followingId: ctx.user?.id },
              select: { followerId: true },
            })
            .then((follows) => follows.map((follow) => follow.followerId)),
        },
        NOT: { followingId: ctx.user?.id },
      },
      select: { followingId: true },
    });

    const limit = 5;
    const userIds = followedByFollowings.map(follow => follow.followingId);
    const recommendations = await prismaClient.user.findMany({
      where: { id: { in: userIds } },
      take: limit,
    });

    return recommendations
  },
};

const mutations = {
  changeFollow: async (
    parent: any,
    { payload }: { payload: IFollowPayload },
    ctx: IGraphqlContext
  ) => {
    if (!ctx.user?.id) throw new Error("User not Logined");
    if (ctx.user.id === payload.userId)
      throw new Error("You cannot follow yourself!");
    const follow = await prismaClient.follow.findFirst({
      where: {
        followingId: payload.userId,
        followerId: ctx.user.id,
      },
    });
    let message = "";
    if (follow?.id) {
      message = "Unfollowed successfully!";
      await prismaClient.follow.delete({
        where: {
          id: follow.id,
        },
      });
      return message;
    }
    message = "Followed successfully!";
    await prismaClient.follow.create({
      data: {
        followingId: payload.userId,
        followerId: ctx.user.id,
      },
    });

    return message;
  },
};

const extraResolvers = {
  User: {
    tweets: (parent: User) =>
      prismaClient.tweet.findMany({
        where: {
          authorId: parent.id,
        },
      }),
    comments: (parent: User) =>
      prismaClient.comment.findMany({
        where: {
          authorId: parent.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

    followers: async (parent: User) => {
      const result = await prismaClient.follow.findMany({
        where: {
          following: {
            id: parent.id,
          },
        },
        include: {
          follower: true,
        },
      });
      return result.map((e) => e.follower);
    },
    followings: async (parent: User) => {
      const result = await prismaClient.follow.findMany({
        where: {
          follower: {
            id: parent.id,
          },
        },
        include: {
          following: true,
        },
      });
      return result.map((e) => e.following);
    },
  },
};

export const resolvers = {
  queries,
  extraResolvers,
  mutations,
};
