
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { teacherId, name, email, password, phoneNumber } =
      await req.json();

    // Validate required fields
    if (
      typeof teacherId !== "string" ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof phoneNumber !== "string" ||
      !teacherId.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password ||
      !phoneNumber.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedTeacherId = teacherId.trim();
    const normalizedPhone = phoneNumber.trim();

    // Check existing Teacher ID
    const existingTeacherId = await db.orm.public.Teacher.where({
      teacherId: normalizedTeacherId,
    }).first();

    if (existingTeacherId) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher ID already exists",
        },
        { status: 409 }
      );
    }

    // Check existing email
    const existingEmail = await db.orm.public.Teacher.where({
      email: normalizedEmail,
    }).first();

    if (existingEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered",
        },
        { status: 409 }
      );
    }

    // Check existing phone number
    const existingPhone = await db.orm.public.Teacher.where({
      phoneNumber: normalizedPhone,
    }).first();

    if (existingPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number already registered",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Teacher
    const teacher = await db.orm.public.Teacher.create({
      teacherId: normalizedTeacherId,
      name: name.trim(),
      email: normalizedEmail,
      phoneNumber: normalizedPhone,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Teacher registered successfully",
        data: {
          id: teacher.id,
          teacherId: teacher.teacherId,
          name: teacher.name,
          email: teacher.email,
          phoneNumber: teacher.phoneNumber,
          role: teacher.role,
          createdAt: teacher.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Teacher Registration Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
