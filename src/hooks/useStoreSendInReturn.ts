import { useMutation } from "@tanstack/react-query";
import { storeSendInReturnApi } from "../api/storeSendInReturn";

export const useStoreSendInReturn = (token: string, flag: string) => {
  return useMutation({
    mutationFn: ({
      formData,
      flag
    }: {
      formData: FormData;
      flag: string;
    }) => {
      if (!token) throw new Error("No token");
      
      return storeSendInReturnApi({ token, flag, formData });
    },
  });
};
