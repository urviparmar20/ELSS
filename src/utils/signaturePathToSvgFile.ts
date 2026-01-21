// src/utils/signaturePathToSvgFile.ts
import * as FileSystem from "expo-file-system";

export const signaturePathToSvgFile = async (
  svgPath: string,
  fileName: string
) => {
  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="150">
      <path d="${svgPath}" fill="none" stroke="black" stroke-width="2"/>
    </svg>
  `;

  const fileUri = FileSystem.cacheDirectory + fileName;

  await FileSystem.writeAsStringAsync(
    fileUri,
    svgContent,
    { encoding: FileSystem.EncodingType.UTF8 } // ✅ Expo-safe UTF8
  );

  return {
    uri: fileUri,
    name: fileName,
    type: "image/svg+xml",
  };
};
