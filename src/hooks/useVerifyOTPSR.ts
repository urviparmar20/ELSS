import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { verifyOTPSR } from "../api/verifyOTPSR";

export const useVerifyOTPSR = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useMutation({
    mutationFn: (smsOTP: string) =>
      verifyOTPSR({
        userId: userId as number,
        smsOTP,
        token: token as string,
      }),
  });
};
