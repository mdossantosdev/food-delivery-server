import { Request } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IMerchantPayload } from '../interfaces/IMerchant';
import { JWT_SECRET, TOKEN_LIFE } from '../config';

export const generatePasswordHash = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const validatePassword = async (password: string, passwordHash: string) => {
  return await bcrypt.compare(password, passwordHash);
};

export const generateToken = (payload: IMerchantPayload) => {
  const secret = JWT_SECRET as string;
  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: TOKEN_LIFE,
  };
  return jwt.sign(payload, secret, signOptions);
};

export const verifyToken = (req: Request) => {
  const secret = JWT_SECRET as string;
  const token = req.get('Authorization');

  if (!token) {
    return false;
  }

  const decoded = jwt.verify(token.split(' ')[1], secret) as IMerchantPayload;

  req.user = decoded;
  return true;
};
