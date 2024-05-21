export interface IJWTUser {
  id: string;
  email: string;
}

export interface IGraphqlContext {
  user?: IJWTUser;
}
