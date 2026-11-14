
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
    const { loginId, password } = await req.json();

    // 1. Validate input
    if (
      typeof loginId !== "string" ||
      typeof password !== "string" ||
      !loginId.trim() ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher ID / Email and password are required",
        },
        { status: 400 }
      );
    }

    const normalizedLoginId = loginId.trim();

    // 2. Find teacher by email first
    let teacher = await db.orm.public.Teacher.first({
      email: normalizedLoginId.toLowerCase(),
    });

    // 3. If email not found, search by Teacher ID
    if (!teacher) {
      teacher = await db.orm.public.Teacher.first({
        teacherId: normalizedLoginId,
      });
    }

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    if(teacher.status !== "Active"){
      return NextResponse.json({
        success:false,
        error:true,
        message:"Your account is not active. Please contact the administrator."

      },{
        status:403
      })
    }

    // 4. Verify password
    const isValidPassword = await bcrypt.compare(
      password,
      teacher.password
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
      id: teacher.id,
      teacherId: teacher.teacherId,
      email: teacher.email,
      role: "Teacher" as const,
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

    // 12. Save refresh token using Prisma 8
    await db.orm.public.RefreshToken.create({
      jti,
      tokenHash,
      expiresAt,
      teacherId: teacher.id,
      userAgent,
      ipAddress,
    });

    // 13. Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Teacher login successful",
        data: {
          id: teacher.id,
          teacherId: teacher.teacherId,
          name: teacher.name,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          role: teacher.role,
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
    console.error("Teacher Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
