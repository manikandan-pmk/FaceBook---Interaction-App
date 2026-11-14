
export const UPLOAD_CONFIG = {
  POST: {
    DIRECTORY: "uploads/posts",

    IMAGE: {
      MAX_SIZE: 5 * 1024 * 1024,
      ALLOWED_TYPES: {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
      } as Record<string, string>,
    },

    VIDEO: {
      MAX_SIZE: 15 * 1024 * 1024,
      ALLOWED_TYPES: {
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
      } as Record<string, string>,
    },
  },
};
