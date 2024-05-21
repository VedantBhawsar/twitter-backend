export const types = `#graphql
 
input FollowData {
    userId: String!
}

type Follow{
    id: ID! 
    follower: [User]
    following: [User]
}

type User {
    id: ID!
    firstName: String!
    lastName: String
    email: String!
    profileImageUrl: String
    tweets: [Tweet]
    comments: [Comment]
    followers: [User]
    followings: [User]
}
`;
