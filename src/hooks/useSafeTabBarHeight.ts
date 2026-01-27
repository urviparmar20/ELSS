import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export function useSafeTabBarHeight() {
  try {
    return useBottomTabBarHeight();
  } catch {
    return 0;
  }
}
