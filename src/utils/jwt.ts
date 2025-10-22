import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION as string;

export const generateAccessToken = (payload: JwtPayload): string => {
  if (!JWT_SECRET || !JWT_EXPIRATION) {
    throw new Error("JWT_SECRET or JWT_EXPIRATION is not set");
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION as Exclude<
      jwt.SignOptions["expiresIn"],
      undefined
    >,
  });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  if (!JWT_REFRESH_SECRET || !JWT_REFRESH_EXPIRATION) {
    throw new Error("JWT_REFRESH_SECRET or JWT_REFRESH_EXPIRATION is not set");
  }
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRATION as Exclude<
      jwt.SignOptions["expiresIn"],
      undefined
    >,
  });
};
