import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt";

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, jwtConfig.accessTokenSecret, {
        expiresIn: jwtConfig.accessTokenExpiry,
    });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, jwtConfig.refreshTokenSecret, {
        expiresIn: jwtConfig.refreshTokenExpiry,
    });
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, jwtConfig.refreshTokenSecret) as TokenPayload;
};
