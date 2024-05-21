export const types = `#graphql

input LikeData{
    tweetId: String!
}

type Like {
    id: ID!
    tweet: Tweet
    author: User
}
`;
