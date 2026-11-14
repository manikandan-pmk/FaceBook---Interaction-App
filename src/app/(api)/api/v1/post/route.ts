
import { NextRequest, NextResponse } from "next/server";

import db from "@/lib/db";
import {
  uploadPostMedia,
  deletePostMedia,
} from "@/lib/upload";



export async function POST(req: NextRequest) {
  let uploadDirectory: string | null = null;

  try {
    // 1. Get authenticated user from proxy
    const userId = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    console.log("POST AUTH DEBUG:", {
  userId,
  userRole,
});

    if (!userId || userRole !== "Teacher") {
      return NextResponse.json(
        {
          success: false,
          message: "Only teachers can create posts",
        },
        { status: 403 }
      );
    }

    // 2. Find teacher
    const teacher = await db.orm.public.Teacher.first({
      id: Number(userId),
    });

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: "Teacher not found",
        },
        { status: 404 }
      );
    }

    // 3. Read form data
    const formData = await req.formData();

    const captionValue = formData.get("caption");
    const mediaValue = formData.get("media");

    if (
      captionValue !== null &&
      typeof captionValue !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid caption",
        },
        { status: 400 }
      );
    }

    const caption =
      typeof captionValue === "string"
        ? captionValue.trim()
        : null;

    if (mediaValue !== null && !(mediaValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid media file",
        },
        { status: 400 }
      );
    }

    const mediaFile =
      mediaValue instanceof File ? mediaValue : null;

    if (!caption && !mediaFile) {
      return NextResponse.json(
        {
          success: false,
          message: "Caption or media is required",
        },
        { status: 400 }
      );
    }

    // 4. Upload media
    const upload = await uploadPostMedia(mediaFile);

    uploadDirectory = upload.directory;

    // 5. Create post
    const post = await db.orm.public.Post.create({
      id: upload.postId,
      caption,
      media: upload.media,
      type: upload.type,
      teacherId: teacher.teacherId,
      status:"Inactive"
    });

    // 6. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Post created successfully",
        data: post,
      },
      { status: 201 }
    );

  } catch (error: any) {
    // 7. Remove media if database operation fails
    await deletePostMedia(uploadDirectory).catch(console.error);

    console.error("Create Post Error:", error);

    const isUploadError =
      error.message === "Unsupported image or video format" ||
      error.message === "Image size cannot exceed 5 MB" ||
      error.message === "Video size cannot exceed 15 MB";

    return NextResponse.json(
      {
        success: false,
        message: isUploadError
          ? error.message
          : "Failed to create post",
      },
      { status: isUploadError ? 400 : 500 }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    // Fetch all posts
    const allPosts = await db.orm.public.Post.all();

    // Filter active posts and sort newest first
    const posts = allPosts
      .filter((post) => post.status === "Active")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    return NextResponse.json(
      {
        success: true,
        message: "Active posts fetched successfully",
        count: posts.length,
        data: posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch Active Posts Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch posts",
      },
      { status: 500 }
    );
  }
}
