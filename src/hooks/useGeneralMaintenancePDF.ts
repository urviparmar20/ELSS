import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { RootState } from "../store";
import { generalMaintenancePDFApi } from "../api/generalMaintenancePDF";

export const useGeneralMaintenancePDF = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  const mutation = useMutation({
    mutationFn: async (gmId: number) => {
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      return generalMaintenancePDFApi({
        gmId,
        userId,
        token,
      });
    },
  });

  return mutation;
};