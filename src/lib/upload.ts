
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


export type AdvertisementMediaType = "IMAGE" | "GIF" | "VIDEO";

export interface AdvertisementUploadResult {
  mediaUrl: string;
  type: AdvertisementMediaType;
  directory: string;
}

export async function uploadAdvertisementMedia(
  file: File,
  expectedType: AdvertisementMediaType
): Promise<AdvertisementUploadResult> {
  const postConfig = UPLOAD_CONFIG.POST;

  let extension: string;
  let maxSize: number;

  if (expectedType === "GIF") {
    if (file.type !== "image/gif") {
      throw new Error("Please upload a valid GIF file");
    }

    extension = ".gif";
    maxSize = postConfig.IMAGE.MAX_SIZE;
  } else if (expectedType === "IMAGE") {
    const imageExtension = postConfig.IMAGE.ALLOWED_TYPES[file.type];

    if (!imageExtension || file.type === "image/gif") {
      throw new Error("Unsupported image format");
    }

    extension = imageExtension;
    maxSize = postConfig.IMAGE.MAX_SIZE;
  } else {
    const videoExtension = postConfig.VIDEO.ALLOWED_TYPES[file.type];

    if (!videoExtension) {
      throw new Error("Unsupported video format");
    }

    extension = videoExtension;
    maxSize = postConfig.VIDEO.MAX_SIZE;
  }

  if (!file.size) {
    throw new Error("Uploaded file is empty");
  }

  if (file.size > maxSize) {
    throw new Error(
      expectedType === "VIDEO"
        ? "Video size cannot exceed 15 MB"
        : "Image size cannot exceed 5 MB"
    );
  }

  const uploadId = randomUUID();

  const directory = path.join(
    process.cwd(),
    "public",
    postConfig.DIRECTORY,
    "advertisements",
    uploadId
  );

  try {
    await mkdir(directory, { recursive: true });

    const fileName = `media${extension}`;
    const filePath = path.join(directory, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(filePath, buffer, { flag: "wx" });

    return {
      mediaUrl: `/${postConfig.DIRECTORY}/advertisements/${uploadId}/${fileName}`,
      type: expectedType,
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
