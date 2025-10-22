import { type Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./jwt";

export const setCookies = (res: Response, payload: string): void => {
  const accessToken = generateAccessToken({ id: payload });
  const refreshToken = generateRefreshToken({ id: payload });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * Number(process.env.JWT_COOKIE_AGE),
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * Number(process.env.JWT_REFRESH_COOKIE_AGE),
  });
};
