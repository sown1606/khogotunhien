import path from "node:path";

const LEGACY_PUBLIC_UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads");
const PERSISTENT_UPLOAD_DIRECTORY_NAME = "khogotunhien-uploads";

function uniqueDirectories(directories: string[]) {
  return [...new Set(directories.map((directory) => path.resolve(directory)))];
}

function getHostingerStableUploadDirectory() {
  const match = process
    .cwd()
    .match(/^(.*\/domains\/[^/]+)\/hbuilds\/(?:versions\/[^/]+|current)\/nodejs$/);

  if (!match?.[1]) {
    return null;
  }

  return path.join(match[1], "nodejs", "public", "uploads");
}

function getHomeUploadDirectory() {
  const configuredHome = process.env.HOME?.trim();
  const inferredHostingerHome = process.cwd().match(/^(\/home\/[^/]+)\/domains\//)?.[1];
  const homeDirectory = configuredHome || inferredHostingerHome;

  return homeDirectory ? path.join(homeDirectory, PERSISTENT_UPLOAD_DIRECTORY_NAME) : null;
}

export function getUploadDirectory() {
  const configuredDirectory = process.env.UPLOAD_DIR?.trim();

  if (configuredDirectory) {
    return path.resolve(configuredDirectory);
  }

  const homeUploadDirectory = getHomeUploadDirectory();

  if (process.env.NODE_ENV === "production" && homeUploadDirectory) {
    return homeUploadDirectory;
  }

  return LEGACY_PUBLIC_UPLOAD_DIRECTORY;
}

export function getUploadReadDirectories() {
  const configuredDirectory = process.env.UPLOAD_DIR?.trim();

  return uniqueDirectories([
    configuredDirectory ? path.resolve(configuredDirectory) : "",
    getHomeUploadDirectory() || "",
    getHostingerStableUploadDirectory() || "",
    LEGACY_PUBLIC_UPLOAD_DIRECTORY,
  ].filter(Boolean));
}

export function resolveUploadPath(uploadDirectory: string, segments: string[]) {
  const filePath = path.resolve(uploadDirectory, ...segments);
  const relativePath = path.relative(uploadDirectory, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}
