
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) => {
  try {
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!userId || !userRole) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Only Admin can update teacher status
    if (userRole !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Access Denied" },
        { status: 403 }
      );
    }

    const { teacherId } = await params;

    if (!teacherId?.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid teacher ID" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!["Active", "Inactive"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status must be Active or Inactive",
        },
        { status: 400 }
      );
    }

    // Find teacher
    const teacher = await db.orm.public.Teacher
      .where({ teacherId })
      .first();

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    if (teacher.status === status) {
      return NextResponse.json({
        success: true,
        message: `Teacher is already ${status}`,
        data: teacher,
      });
    }

    // Update teacher status
    await db.orm.public.Teacher
      .where({ teacherId })
      .update({ status });

    const updatedTeacher = await db.orm.public.Teacher
      .where({ teacherId })
      .first();

    return NextResponse.json({
      success: true,
      message: `Teacher ${status} successfully`,
      data: updatedTeacher,
    });

  } catch (error) {
    console.error("Error updating teacher status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error updating teacher status",
      },
      { status: 500 }
    );
  }
};
