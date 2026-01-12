import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { storeServiceReportApi, ServiceReportStoreParams } from "../api/storeServiceReport";

export const useStoreServiceReport = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const mutation = useMutation({
    mutationFn: (params: Omit<ServiceReportStoreParams, "token">) => {
      if (!token) throw new Error("No token found");
      return storeServiceReportApi({ ...params, token });
    },
  });

  return mutation;
};
