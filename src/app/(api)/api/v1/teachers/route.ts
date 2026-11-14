
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    // 1. Authentication
    if (!userId || !userRole) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Role authorization
    if (userRole !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 3. Verify Admin exists
    const admin = await db.orm.public.Admin
      .whereUnique({ id: Number(userId) })
      .select("id")
      .first();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    // 4. Fetch all teachers
    const teachers = await db.orm.public.Teacher
      .select(
        "id",
        "teacherId",
        "name",
        "email",
        "phoneNumber",
        "role",
        "status",
        "createdAt",
        "updatedAt"
      )
      .orderBy((t) => t.createdAt.desc())
      .all();

    // 5. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Teachers fetched successfully",
        count: teachers.length,
        teachers,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("GET TEACHERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
};
