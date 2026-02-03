import { useMutation } from "@tanstack/react-query";
import { storeServiceReportApi } from "../api/storeServiceReport";
import { ServiceReportMode } from "../types/serviceReport";

export const useStoreServiceReport = (token: string) => {
  return useMutation({
    mutationFn: ({
      formData,
      mode,
    }: {
      formData: FormData;
      mode: ServiceReportMode;
    }) => {
      if (!token) throw new Error("No token");
      return storeServiceReportApi({ token, formData, mode });
    },
  });
};
