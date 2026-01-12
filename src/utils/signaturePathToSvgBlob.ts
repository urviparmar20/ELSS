export const signaturePathToSvgBlob = (
  path: string,
  width = 300,
  height = 150
): Blob => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <path d="${path}" fill="none" stroke="black" stroke-width="2" />
    </svg>
  `;

  return new Blob([svg], { type: "image/svg+xml" });
};
