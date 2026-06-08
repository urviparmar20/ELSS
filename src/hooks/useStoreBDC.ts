import { useMutation } from "@tanstack/react-query";
import { storeBDCApi } from "../api/storeBDC";

export const useStoreBDC = (token: string) => {
  return useMutation({
    mutationFn: ({
      formData,
    }: {
      formData: FormData;
    }) => {
      if (!token) throw new Error("No token");
      return storeBDCApi({ token, formData });
    },
  });
};
