import * as FileSystem from "expo-file-system/legacy";

export const ensureFileExists = async (uri: string) => {
  if (!uri) return null;

  let tries = 0;

  while (tries < 10) {
    const info = await FileSystem.getInfoAsync(uri);

    if (info.exists && info.size > 0) {
      return uri;
    }

    await new Promise(r => setTimeout(r, 300));
    tries++;
  }

  throw new Error(`File not ready: ${uri}`);
};