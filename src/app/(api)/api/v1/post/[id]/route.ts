
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await req.json();

    if (!["like", "share", "view"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid action",
        },
        { status: 400 }
      );
    }

    const post = await db.orm.public.Post
      .where({ id, status: "Active" })
      .first();

    if (!post) {
      return NextResponse.json(
        {
          success: false,
          message: "Active post not found",
        },
        { status: 404 }
      );
    }

    const updatedPost = await db.orm.public.Post
      .where({ id, status: "Active" })
      .update({
        ...(action === "like" && {
          likes: post.likes + 1,
        }),
        ...(action === "share" && {
          shares: post.shares + 1,
        }),
        ...(action === "view" && {
          views: post.views + 1,
        }),
      });

    if (!updatedPost) {
      return NextResponse.json(
        {
          success: false,
          message: "Post update failed",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${action} updated successfully`,
      data: {
        id: updatedPost.id,
        likes: updatedPost.likes,
        shares: updatedPost.shares,
        views: updatedPost.views,
      },
    });

  } catch (error) {
    console.error("Post Interaction Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update post interaction",
      },
      { status: 500 }
    );
  }
}
