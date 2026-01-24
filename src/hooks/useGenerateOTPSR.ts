import { useSelector } from "react-redux";
import { RootState } from "../store";
import { generateOTPSR } from "../api/generateOTPSR";

import { useMutation } from "@tanstack/react-query";

export const useGenerateOTPSR = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useMutation({
    mutationFn: (contactNo: string) =>
      generateOTPSR({
        userId: userId as number,
        contactNo,
        token: token as string,
      }),
  });
};

