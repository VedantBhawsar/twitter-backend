"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const express_1 = __importDefault(require("express"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const user_1 = require("./user");
const tweet_1 = require("./tweet");
const comment_1 = require("./comment");
const jwt_1 = __importDefault(require("../services/jwt"));
const like_1 = require("./like");
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.use(body_parser_1.default.json());
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `#graphql
    ${user_1.User.types}
    ${tweet_1.Tweet.types}
    ${comment_1.Comment.types}
          ${like_1.Like.types}
    type Query {
      ${user_1.User.queries}
      ${tweet_1.Tweet.queries}
      ${comment_1.Comment.queries}
    }
    type Mutation{
      ${user_1.User.mutations}
      ${tweet_1.Tweet.mutations}
      ${comment_1.Comment.mutations}
      ${like_1.Like.mutations}
    }
    `,
            resolvers: Object.assign(Object.assign(Object.assign(Object.assign({ Query: Object.assign(Object.assign(Object.assign({}, user_1.User.resolvers.queries), tweet_1.Tweet.resolvers.queries), comment_1.Comment.resolvers.queries), Mutation: Object.assign(Object.assign(Object.assign(Object.assign({}, user_1.User.resolvers.mutations), tweet_1.Tweet.resolvers.mutations), comment_1.Comment.resolvers.mutations), like_1.Like.resolvers.mutations) }, tweet_1.Tweet.resolvers.extraResolvers), user_1.User.resolvers.extraResolvers), comment_1.Comment.resolvers.extraResolvers), like_1.Like.resolvers.extraResolvers),
        });
        yield graphqlServer.start();
        app.use('/graphql', (0, cors_1.default)(), express_1.default.json(), (0, express4_1.expressMiddleware)(graphqlServer, {
            context: (_a) => __awaiter(this, [_a], void 0, function* ({ req, res }) {
                return {
                    user: req.headers.authorization
                        ? jwt_1.default.decodeToken(req.headers.authorization.split(' ')[1])
                        : req.headers.authorization,
                };
            }),
        }));
        return app;
    });
}
exports.initServer = initServer;
