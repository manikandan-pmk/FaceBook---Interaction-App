
import {
  SignJWT,
  jwtVerify,
  type JWTPayload,
} from "jose";

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET!
);

const refreshSecret = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET!
);

export interface AuthPayload extends JWTPayload {
  id: number;
  role:"Admin" | "Teacher";
  email:string;
  adminId?: string;
}

// Generate Access Token
export async function generateAccessToken(
  user: AuthPayload
) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(accessSecret);
}

// Generate Refresh Token
export async function generateRefreshToken(
  user: AuthPayload
) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(refreshSecret);
}

// Verify Access Token
export async function verifyAccessToken(token: string) {
  return jwtVerify(token, accessSecret);
}

// Verify Refresh Token
export async function verifyRefreshToken(token: string) {
  return jwtVerify(token, refreshSecret);
}
