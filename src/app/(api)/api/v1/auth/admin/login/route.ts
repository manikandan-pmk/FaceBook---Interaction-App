
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { createHash, randomUUID } from "crypto";

import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();

    // 1. Validate input
    if (
      typeof phoneNumber !== "string" ||
      typeof password !== "string" ||
      !phoneNumber.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number and password are required",
        },
        { status: 400 }
      );
    }

    const normalizedPhoneNumber = phoneNumber.trim();

    // 2. Find Admin
    const admin = await db.orm.public.Admin.first({
      phoneNumber: normalizedPhoneNumber,
    });

    // 3. Check account existence
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // 4. Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      admin.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // 5. Token payload
    const tokenPayload = {
      id: admin.id,
      adminId: admin.adminId,
      email: admin.email,
      role: "Admin" as const,
    };

    // 6. Generate access token
    const accessToken = await generateAccessToken(tokenPayload);

    // 7. Generate refresh token session ID
    const jti = randomUUID();

    // 8. Generate refresh token
    const refreshToken = await generateRefreshToken({
      ...tokenPayload,
      jti,
    });

    // 9. Hash refresh token
    const tokenHash = createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // 10. Refresh token expiry (7 days)
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    // 11. Request metadata
    const userAgent = req.headers.get("user-agent") || null;

    const ipAddress =
      req.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    // 12. Save refresh token
    await db.orm.public.RefreshToken.create({
      jti,
      tokenHash,
      expiresAt,
      adminId: admin.id,
      userAgent,
      ipAddress,
    });

    // 13. Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful",

        data: {
          id: admin.id,
          adminId: admin.adminId,
          name: admin.name,
          email: admin.email,
          phoneNumber: admin.phoneNumber,
          role: admin.role,
        },
      },
      { status: 200 }
    );

    // 14. Access token cookie (15 minutes)
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    // 15. Refresh token cookie (7 days)
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
