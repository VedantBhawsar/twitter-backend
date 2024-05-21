import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { IJWTUser } from '../interfaces';

const jwtSecret = process.env.JWT_SECRET as string

class JWTService {
  public static generateTokenForUser(user: User) {
    const playload: IJWTUser = {
      id: user?.id,
      email: user?.email,
    };
    const token = jwt.sign(playload, jwtSecret, {
      expiresIn: '1D',
    });
    return token;
  }

  public static decodeToken(token: string) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      return null;
    }
  }
}

export default JWTService;
