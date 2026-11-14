
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

import db from "@/lib/db";

import {
  verifyRefreshToken,
  generateAccessToken,
  type AuthPayload,
} from "@/lib/jwt";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function unauthorized(message = "Invalid or expired refresh token") {
  const response = NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Get refresh token from HTTP-only cookie
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return unauthorized("Refresh token not found");
    }

    // 2. Verify refresh token using your existing JWT function
    let payload;

    try {
      const verified = await verifyRefreshToken(refreshToken);
      payload = verified.payload;
    } catch {
      return unauthorized("Refresh token is invalid or expired");
    }

    // 3. Validate JWT payload
   if (
  typeof payload.id !== "number" ||
  !Number.isInteger(payload.id) ||
  !["Admin", "Teacher"].includes(String(payload.role)) ||
  typeof payload.jti !== "string" ||
  typeof payload.email !== "string"
) {
  return unauthorized("Invalid refresh token payload");
}

    const userId = payload.id;
    const role = payload.role as AuthPayload["role"];
    const jti = payload.jti;

    // 4. Hash the received refresh token
    const tokenHash = hashToken(refreshToken);

    // 5. Find refresh token session in database
    const storedToken = await db.orm.public.RefreshToken
      .where({ jti })
      .first();

    if (!storedToken) {
      return unauthorized("Refresh token session not found");
    }

    // 6. Verify stored token hash
    if (storedToken.tokenHash !== tokenHash) {
      return unauthorized("Refresh token does not match");
    }

    // 7. Check revoked status
    if (storedToken.revokedAt) {
      return unauthorized("Refresh token has been revoked");
    }

    // 8. Check database expiration
    if (
      !storedToken.expiresAt ||
      new Date(storedToken.expiresAt).getTime() <= Date.now()
    ) {
      return unauthorized("Refresh token has expired");
    }

    // 9. Verify that the user still exists
    let userExists = false;

    switch (role) {
      case "Admin": {
        const user = await db.orm.public.Admin
          .where({ id: userId })
          .first();

        userExists =
          !!user && storedToken.adminId === userId;

        break;
      }

      case "Teacher": {
        const user = await db.orm.public.Teacher
          .where({ id: userId })
          .first();

        userExists =
          !!user && storedToken.teacherId === userId;

        break;
      }
    }

    if (!userExists) {
      return unauthorized("User account not found");
    }

    // 10. Prepare access token payload
    const accessPayload: AuthPayload = {
      id: userId,
       email: payload.email,
      role,
      ...(typeof payload.adminId === "string"
        ? { adminId: payload.adminId }
        : {}),
    };

    // 11. Generate a new access token
    const accessToken = await generateAccessToken(accessPayload);

    // 12. Set new access token cookie
    const response = NextResponse.json({
      success: true,
      message: "Access token refreshed successfully",
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;

  } catch (error) {
    console.error("Refresh token error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
