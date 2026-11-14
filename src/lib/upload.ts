
import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile, rm } from "fs/promises";

import { UPLOAD_CONFIG } from "@/config/upload.config";

export type PostMediaType = "TEXT" | "IMAGE" | "VIDEO";

interface UploadResult {
  postId: string;
  media: string | null;
  type: PostMediaType;
  directory: string | null;
}

export async function uploadPostMedia(
  file: File | null
): Promise<UploadResult> {
  const postId = randomUUID();

  if (!file || file.size === 0) {
    return {
      postId,
      media: null,
      type: "TEXT",
      directory: null,
    };
  }

  const config = UPLOAD_CONFIG.POST;

  let type: PostMediaType;
  let extension: string;
  let maxSize: number;

  // Validate image
  if (config.IMAGE.ALLOWED_TYPES[file.type]) {
    type = "IMAGE";
    extension = config.IMAGE.ALLOWED_TYPES[file.type];
    maxSize = config.IMAGE.MAX_SIZE;
  }

  // Validate video
  else if (config.VIDEO.ALLOWED_TYPES[file.type]) {
    type = "VIDEO";
    extension = config.VIDEO.ALLOWED_TYPES[file.type];
    maxSize = config.VIDEO.MAX_SIZE;
  } else {
    throw new Error("Unsupported image or video format");
  }

  // Validate file size
  if (file.size > maxSize) {
    throw new Error(
      type === "IMAGE"
        ? "Image size cannot exceed 5 MB"
        : "Video size cannot exceed 15 MB"
    );
  }

  const directory = path.join(
    process.cwd(),
    "public",
    config.DIRECTORY,
    postId
  );

  try {
    await mkdir(directory, { recursive: true });

    const fileName = `media${extension}`;

    const filePath = path.join(directory, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer, { flag: "wx" });

    return {
      postId,
      media: `/${config.DIRECTORY}/${postId}/${fileName}`,
      type,
      directory,
    };
  } catch (error) {
    await rm(directory, {
      recursive: true,
      force: true,
    }).catch(() => {});

    throw error;
  }
}

// Delete uploaded media folder
export async function deletePostMedia(directory: string | null) {
  if (!directory) return;

  await rm(directory, {
    recursive: true,
    force: true,
  });
}
