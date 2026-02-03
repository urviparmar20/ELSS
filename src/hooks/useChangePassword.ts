import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { changePassword } from "../api/changePassword";

export const useChangePassword = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useMutation({
    mutationFn: (password: string) =>
      changePassword({
        userId: userId as number,
        password,
        token: token as string,
      }),
  });
};
