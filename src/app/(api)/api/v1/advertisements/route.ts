
import { NextRequest, NextResponse } from "next/server";
import { or } from "@prisma/orm-postgres/orm-client";
import db from "@/lib/db";
import {
  uploadAdvertisementMedia,
  deletePostMedia,
} from "@/lib/upload";


const ADVERTISEMENT_TYPES = [
  "IMAGE",
  "GIF",
  "VIDEO",
  "YOUTUBE",
] as const;

type AdvertisementType = (typeof ADVERTISEMENT_TYPES)[number];

// ==================================================
// AUTHENTICATION - PROXY HEADERS
// ==================================================

function getUserAuth(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const userRole = request.headers.get("x-user-role");

  return { userId, userRole };
}

function isAdmin(request: NextRequest) {
  const { userId, userRole } = getUserAuth(request);

  return !!userId && userRole === "Admin";
}

function isValidType(type: unknown): type is AdvertisementType {
  return (
    typeof type === "string" &&
    ADVERTISEMENT_TYPES.includes(type as AdvertisementType)
  );
}

// ==================================================
// POST - CREATE ADVERTISEMENT (ADMIN ONLY)
// ==================================================


export async function POST(request: NextRequest) {
  let uploadDirectory: string | null = null;

  try {
    // 1. Authentication
    const { userId, userRole } = getUserAuth(request);

    console.log("ADVERTISEMENT POST AUTH:", {
      userId,
      userRole,
    });

    if (!userId || userRole !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access only",
        },
        { status: 403 }
      );
    }

    // 2. Read FormData
    const formData = await request.formData();

    const name = formData.get("name");
    const description = formData.get("description");
    const type = formData.get("type");
    const media = formData.get("media");
    const mediaUrl = formData.get("mediaUrl");
    const thumbnail = formData.get("thumbnail");
    const displayOrder = formData.get("displayOrder");
    const startDate = formData.get("startDate");
    const endDate = formData.get("endDate");

    // 3. Validate required fields
    if (
      typeof name !== "string" ||
      !name.trim() ||
      !isValidType(type)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Advertisement name and valid type are required",
        },
        { status: 400 }
      );
    }

    // 4. Validate media based on advertisement type
    let uploadedMediaUrl: string;

    if (type === "YOUTUBE") {
      if (typeof mediaUrl !== "string" || !mediaUrl.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "YouTube URL is required",
          },
          { status: 400 }
        );
      }

      try {
        const parsedUrl = new URL(mediaUrl);

        const allowedHosts = [
          "youtube.com",
          "www.youtube.com",
          "m.youtube.com",
          "youtu.be",
          "www.youtube-nocookie.com",
        ];

        if (!allowedHosts.includes(parsedUrl.hostname)) {
          throw new Error("Invalid YouTube URL");
        }

        if (
          parsedUrl.hostname === "youtu.be" &&
          !parsedUrl.pathname.slice(1)
        ) {
          throw new Error("Invalid YouTube video URL");
        }

        if (
          parsedUrl.hostname !== "youtu.be" &&
          !parsedUrl.searchParams.get("v") &&
          !parsedUrl.pathname.startsWith("/embed/") &&
          !parsedUrl.pathname.startsWith("/shorts/")
        ) {
          throw new Error("Invalid YouTube video URL");
        }

        uploadedMediaUrl = mediaUrl.trim();
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "Please provide a valid YouTube video URL",
          },
          { status: 400 }
        );
      }
    } else {
      if (!(media instanceof File) || media.size === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Please upload an advertisement file",
          },
          { status: 400 }
        );
      }

      // 5. Upload IMAGE / GIF / VIDEO
      const upload = await uploadAdvertisementMedia(
        media,
        type
      );

      uploadedMediaUrl = upload.mediaUrl;
      uploadDirectory = upload.directory;
    }

    // 6. Validate dates
    const parsedStartDate =
      typeof startDate === "string" && startDate
        ? new Date(startDate)
        : null;

    const parsedEndDate =
      typeof endDate === "string" && endDate
        ? new Date(endDate)
        : null;

    if (
      (parsedStartDate && isNaN(parsedStartDate.getTime())) ||
      (parsedEndDate && isNaN(parsedEndDate.getTime()))
    ) {
      throw new Error("Invalid advertisement dates");
    }

    if (
      parsedStartDate &&
      parsedEndDate &&
      parsedStartDate > parsedEndDate
    ) {
      throw new Error("End date must be after start date");
    }

    // 7. Validate display order
    const parsedOrder =
      typeof displayOrder === "string"
        ? Number(displayOrder)
        : 0;

    if (
      !Number.isInteger(parsedOrder) ||
      parsedOrder < 0
    ) {
      throw new Error("Invalid display order");
    }

    // 8. Create advertisement
    const advertisement =
      await db.orm.public.Advertisement.create({
        name: name.trim(),

        description:
          typeof description === "string" && description.trim()
            ? description.trim()
            : null,

        type,

        mediaUrl: uploadedMediaUrl,

        thumbnail:
          typeof thumbnail === "string" && thumbnail.trim()
            ? thumbnail.trim()
            : null,

        displayOrder: parsedOrder,

        startDate: parsedStartDate,
        endDate: parsedEndDate,

        // Always inactive initially
        isActive: false,
      });

    // 9. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Advertisement created successfully",
        data: advertisement,
      },
      { status: 201 }
    );

  } catch (error) {
    // 10. Delete uploaded media if creation fails
    await deletePostMedia(uploadDirectory).catch(console.error);

    console.error("Advertisement POST error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create advertisement";

    const validationErrors = [
      "Please upload a valid GIF file",
      "Unsupported image format",
      "Unsupported video format",
      "Image size cannot exceed 5 MB",
      "Video size cannot exceed 15 MB",
      "Uploaded file is empty",
      "Invalid advertisement dates",
      "End date must be after start date",
      "Invalid display order",
    ];

    const isValidationError =
      validationErrors.includes(message);

    return NextResponse.json(
      {
        success: false,
        message: isValidationError
          ? message
          : "Failed to create advertisement",
      },
      {
        status: isValidationError ? 400 : 500,
      }
    );
  }
}

// ==================================================
// GET - ADMIN + NORMAL USERS
// ==================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Check role from proxy headers
    const { userId, userRole } = getUserAuth(request);

    const admin = !!userId && userRole === "Admin";

    console.log("ADVERTISEMENT GET AUTH:", {
      userId,
      userRole,
      admin,
    });

    const now = new Date();

    let advertisements;

    if (admin) {
      // 2. Admin can see all advertisements
      advertisements =
        await db.orm.public.Advertisement
          .orderBy([
            (ad) => ad.displayOrder.asc(),
            (ad) => ad.createdAt.desc(),
          ])
          .all();

    } else {
      // 3. Normal users can see only active
      // advertisements within scheduled dates

      advertisements =
        await db.orm.public.Advertisement
          .where((ad) => ad.isActive.eq(true))
          .where((ad) =>
            or(
              ad.startDate.isNull(),
              ad.startDate.lte(now)
            )
          )
          .where((ad) =>
            or(
              ad.endDate.isNull(),
              ad.endDate.gte(now)
            )
          )
          .orderBy([
            (ad) => ad.displayOrder.asc(),
            (ad) => ad.createdAt.desc(),
          ])
          .all();
    }

    // 4. Success response
    return NextResponse.json(
      {
        success: true,
        message: admin
          ? "All advertisements fetched successfully"
          : "Active advertisements fetched successfully",
        count: advertisements.length,
        data: advertisements,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Advertisement GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch advertisements",
      },
      { status: 500 }
    );
  }
}

// ==================================================
// PATCH - ACTIVATE / DEACTIVATE (ADMIN ONLY)
// ==================================================

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authentication from proxy
    const { userId, userRole } = getUserAuth(request);

    console.log("ADVERTISEMENT PATCH AUTH:", {
      userId,
      userRole,
    });

    if (!userId || userRole !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access only",
        },
        { status: 403 }
      );
    }

    // 2. Read request body
    const body = await request.json();

    const { id, isActive } = body;

    // 3. Validate input
    if (
      typeof id !== "string" ||
      !id.trim() ||
      typeof isActive !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Advertisement ID and boolean isActive are required",
        },
        { status: 400 }
      );
    }

    // 4. Find advertisement
    const existing =
      await db.orm.public.Advertisement
        .where({ id })
        .first();

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Advertisement not found",
        },
        { status: 404 }
      );
    }

    // 5. Update advertisement status
    const advertisement =
      await db.orm.public.Advertisement
        .where({ id })
        .update({
          isActive,
        });

    // 6. Success response
    return NextResponse.json(
      {
        success: true,
        message: isActive
          ? "Advertisement activated successfully"
          : "Advertisement deactivated successfully",
        data: advertisement,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Advertisement PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update advertisement status",
      },
      { status: 500 }
    );
  }
}
