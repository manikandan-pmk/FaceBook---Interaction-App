
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import db from "@/lib/db";

export async function GET() {
  try {
    // Admin authorization
    const headersList = await headers();

    const userId = headersList.get("x-user-id");
    const userRole = headersList.get("x-user-role");

    if (!userId || userRole !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Only Admin can access post approvals",
        },
        { status: 403 }
      );
    }

    // Fetch all posts with safe teacher details
    const posts = await db.orm.public.Post
      .include("teacher", (teacher) =>
        teacher.select(
          "teacherId",
          "name",
          "email"
        )
      )
      .orderBy((post) => post.createdAt.desc())
      .all();

    return NextResponse.json(
      {
        success: true,
        message: "Posts fetched successfully",
        data: posts,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("FETCH_POSTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}
