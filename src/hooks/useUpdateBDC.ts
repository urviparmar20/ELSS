import { useMutation } from "@tanstack/react-query";
import { updateBDCApi } from "../api/updateBDC";

export const useUpdateBDC = (token: string) => {
  return useMutation({
    mutationFn: ({
      formData,
    }: {
      formData: FormData;
    }) => {
      if (!token) throw new Error("No token");
      return updateBDCApi({ token, formData });
    },
  });
};
