
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/lib/db";

const allowedStatuses = ["Active", "Inactive", "Rejected"] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();

    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");

    if (!userId || userRole !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Admin access only" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid post status" },
        { status: 400 }
      );
    }

    const existingPost = await db.orm.public.Post
      .whereUnique({ id })
      .first();

    if (!existingPost) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    const updatedPost = await db.orm.public.Post
      .whereUnique({ id })
      .update({ status });

    return NextResponse.json({
      success: true,
      message: `Post status changed to ${status}`,
      data: updatedPost,
    });

  } catch (error) {
    console.error("UPDATE_POST_STATUS_ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update post status" },
      { status: 500 }
    );
  }
}
