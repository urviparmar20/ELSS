import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { storeGeneralMaintenanceApi, GeneralMaintenanceStoreParams } from "../api/storeGeneralMaintenance";

export const useStoreGeneralMaintenance = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const mutation = useMutation({
    mutationFn: (params: Omit<GeneralMaintenanceStoreParams, "token">) => {
      if (!token) throw new Error("No auth token found");
      return storeGeneralMaintenanceApi({ ...params, token });
    },
  });

  return mutation;
};
