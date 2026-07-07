import { useMutation } from "@tanstack/react-query";
import { storeOnOffHireApi } from "../api/storeOnOffHire";

export const useStoreOnOffHire = (token: string, flag: string) => {
  return useMutation({
    mutationFn: ({
      formData,
      flag
    }: {
      formData: FormData;
      flag: string;
    }) => {
      if (!token) throw new Error("No token");
      return storeOnOffHireApi({ token, flag, formData });
    },
  });
};
