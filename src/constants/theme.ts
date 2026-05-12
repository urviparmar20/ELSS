import { Platform } from "react-native";

const primaryColor = "#da2128";
const primaryDark = "#1565C0";
const primaryLight = "#42A5F5";
const secondaryColor = "#FF9800";
const secondaryDark = "#F57C00";

export const Colors = {
  light: {
    text: "#212121",
    textSecondary: "#757575",
    buttonText: "#FFFFFF",
    tabIconDefault: "#757575",
    tabIconSelected: primaryColor,
    link: primaryColor,
    primary: primaryColor,
    primaryDark: primaryDark,
    primaryLight: primaryLight,
    secondary: secondaryColor,
    secondaryDark: secondaryDark,
    backgroundRoot: "#F5F5F5",
    backgroundDefault: "#FFFFFF",
    backgroundSecondary: "#E8E8E8",
    backgroundTertiary: "#D9D9D9",
    divider: "#E0E0E0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
    info: "#2196F3",
    inputBorder: "#BDBDBD",
    inputBackground: "#FFFFFF",
    blue: "#3269a6",
    blueBG: "#DCEEFF"
  },
  dark: {
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryLight,
    link: primaryLight,
    primary: primaryLight,
    primaryDark: primaryColor,
    primaryLight: "#64B5F6",
    secondary: secondaryColor,
    secondaryDark: secondaryDark,
    backgroundRoot: "#121212",
    backgroundDefault: "#1E1E1E",
    backgroundSecondary: "#2A2A2A",
    backgroundTertiary: "#363636",
    divider: "#424242",
    success: "#66BB6A",
    warning: "#FFA726",
    error: "#EF5350",
    info: "#42A5F5",
    inputBorder: "#424242",
    inputBackground: "#1E1E1E",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 56,
  inputHeight: 56,
  buttonHeight: 48,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 34,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 24,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "500" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "Roboto",
    serif: "serif",
    rounded: "Roboto",
    mono: "monospace",
  },
  web: {
    sans: "Roboto, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "Roboto, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
