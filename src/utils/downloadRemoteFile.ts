import * as FileSystem from "expo-file-system/legacy";

export const downloadRemoteFile = async (
  remoteUrl: string
): Promise<string> => {
  try {
    if (!remoteUrl) throw new Error("Empty URL");

    const filename =
      remoteUrl.split("/").pop()?.split("?")[0] ||
      `file-${Date.now()}.jpg`;

    const localUri = FileSystem.cacheDirectory + filename;

    // 🔥 Download file
    const result = await FileSystem.downloadAsync(
      remoteUrl,
      localUri
    );

    // 🔥 Ensure file is actually written before returning
    let exists = false;
    let retries = 0;

    while (!exists && retries < 10) {
      const info = await FileSystem.getInfoAsync(result.uri);

      if (info.exists) {
        exists = true;
        break;
      }

      await new Promise(res => setTimeout(res, 300));
      retries++;
    }

    if (!exists) {
      throw new Error("Downloaded file not found on disk");
    }

    return result.uri;
  } catch (error) {
    console.log("downloadRemoteFile ERROR:", error);
    throw error;
  }
};