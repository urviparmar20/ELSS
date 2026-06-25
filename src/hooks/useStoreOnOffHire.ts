import { useMutation } from "@tanstack/react-query";
import { storeOnOffHireApi } from "../api/storeOnOffHire";

export const useStoreOnOffHire = (token: string, hireType: string) => {
  return useMutation({
    mutationFn: ({
      formData,
    }: {
      formData: FormData;
    }) => {
      if (!token) throw new Error("No token");
      return storeOnOffHireApi({ token, hireType, formData });
    },
  });
};
