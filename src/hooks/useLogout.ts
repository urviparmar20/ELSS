import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { logoutApi } from "../api/logout";

export const useLogout = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useMutation({
    mutationFn: () =>
      logoutApi({
        userId: userId as number,
        token: token as string,
      }),
  });
};
