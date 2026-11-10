
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, password } = await req.json();

    // Validate input
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

    const phone = phoneNumber.trim();

    // Find Admin and SuperAdmin
const [superAdmin, admin] = await Promise.all([
  db.orm.public.SuperAdmin.where({
    phoneNumber: phone,
  }).first(),

  db.orm.public.Admin.where({
    phoneNumber: phone,
  }).first(),
]);

    // Check account
    if (!superAdmin && !admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number or password",
        },
        { status: 401 }
      );
    }

    // Prevent duplicate account ambiguity
    if (superAdmin && admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Multiple accounts found with this phone number",
        },
        { status: 409 }
      );
    }

    // Identify account
    const user = superAdmin || admin!;

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number or password",
        },
        { status: 401 }
      );
    }

    // JWT secret
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Determine role
    const role = superAdmin ? "SuperAdmin" : "Admin";

    // Generate JWT
    const token = await new SignJWT({
      id: user.id,
      role,
      ...(superAdmin
        ? { superAdminId: superAdmin.superAdminId }
        : {
            adminId: admin!.adminId,
            superAdminId: admin!.superAdminId,
          }),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(new TextEncoder().encode(secret));

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: `${role} login successful`,
        data: {
          id: user.id,
          ...(superAdmin
            ? { superAdminId: superAdmin.superAdminId }
            : {
                adminId: admin!.adminId,
                superAdminId: admin!.superAdminId,
              }),
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role,
        },
      },
      { status: 200 }
    );

    // HTTP-only cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
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
