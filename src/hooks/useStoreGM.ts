import { useMutation } from "@tanstack/react-query";
import { storeGMApi } from "../api/storeGM";

export const useStoreGM = (token: string) => {
  return useMutation({
    mutationFn: ({
      formData,
    }: {
      formData: FormData;
    }) => {
      if (!token) throw new Error("No token");
      return storeGMApi({ token, formData });
    },
  });
};
