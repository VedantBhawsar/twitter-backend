export const types = `#graphql

input CreateCommentInput {
    content: String!
    tweetId: String!
}

type Comment {
    id: ID!
    content: String!
    tweet: Tweet
    author: User
    createdAt: String!
}
`;
