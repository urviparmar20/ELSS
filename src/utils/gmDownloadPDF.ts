import {
  StorageAccessFramework,
  cacheDirectory,
  downloadAsync,
  readAsStringAsync,
  deleteAsync,
  EncodingType,
} from "expo-file-system/legacy";

import { Platform } from "react-native";

type GMDownloadPDFParams = {
  url: string;
  fileName: string;
};

export const gmDownloadPDF = async ({
  url,
  fileName,
}: GMDownloadPDFParams) => {
  // --------------------------------------------------
  // Android only
  // --------------------------------------------------

  if (Platform.OS !== "android") {
    throw new Error(
      "PDF download is currently supported on Android only."
    );
  }

  // --------------------------------------------------
  // 1. Ask user to select a folder
  // --------------------------------------------------

  const permissions =
    await StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    throw new Error(
      "Folder permission was not granted."
    );
  }

  const directoryUri =
    permissions.directoryUri;

  console.log(
    "Selected directory:",
    directoryUri
  );

  // --------------------------------------------------
  // 2. Create temporary local cache path
  // --------------------------------------------------

  if (!cacheDirectory) {
    throw new Error(
      "Expo cache directory is not available."
    );
  }

  const tempFileUri =
    `${cacheDirectory}${fileName}`;

  console.log(
    "Downloading PDF to cache:",
    tempFileUri
  );

  // --------------------------------------------------
  // 3. Download PDF to local cache
  // --------------------------------------------------

  const downloadResult =
    await downloadAsync(
      url,
      tempFileUri
    );

  console.log(
    "PDF downloaded to cache:",
    downloadResult.uri
  );

  // --------------------------------------------------
  // 4. Create PDF file inside selected folder
  // --------------------------------------------------

  const safFileUri =
    await StorageAccessFramework.createFileAsync(
      directoryUri,
      fileName,
      "application/pdf"
    );

  console.log(
    "Created SAF file:",
    safFileUri
  );

  // --------------------------------------------------
  // 5. Read local PDF as Base64
  // --------------------------------------------------

  const base64 =
    await readAsStringAsync(
      downloadResult.uri,
      {
        encoding: EncodingType.Base64,
      }
    );

  console.log(
    "PDF converted to Base64."
  );

  console.log(
    "Base64 length:",
    base64.length
  );

  // --------------------------------------------------
  // 6. Write Base64 into Android SAF file
  // --------------------------------------------------

  await StorageAccessFramework.writeAsStringAsync(
    safFileUri,
    base64,
    {
      encoding: EncodingType.Base64,
    }
  );

  console.log(
    "PDF saved successfully:",
    safFileUri
  );

  // --------------------------------------------------
  // 7. Delete temporary cache file
  // --------------------------------------------------

  try {
    await deleteAsync(
      downloadResult.uri,
      {
        idempotent: true,
      }
    );

    console.log(
      "Temporary cache file deleted."
    );
  } catch (error) {
    console.log(
      "Cache cleanup failed:",
      error
    );
  }

  // --------------------------------------------------
  // 8. Return saved file information
  // --------------------------------------------------

  return {
    uri: safFileUri,
    fileName,
  };
};