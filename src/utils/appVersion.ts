const APP_VERSION = process.env.EXPO_PUBLIC_APP_VERSION ?? '3.2';

export const isCompanyV2Enabled = () => {
  const [major = 0, minor = 0] = APP_VERSION
    .split('.')
    .map(Number);

  return major > 3 || (major === 3 && minor >= 3);
};