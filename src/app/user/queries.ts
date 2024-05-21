export const queries = `#graphql
    verifyGoogleToken(token: String!): String
    getCurrentUser: User
    getUser(userId: String!): User
    getRecommendations: [User]
`;
