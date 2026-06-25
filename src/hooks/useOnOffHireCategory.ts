import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getOnOffHireCategoryApi } from "../api/onOffHireCategory";

export const useOnOffHireCategory = (equipmentTypeId?: string) => {
  const token = useSelector((state: RootState) => state.auth.token);

  return useQuery({
    queryKey: ["on-off-hires-category", equipmentTypeId],
    queryFn: () =>
      getOnOffHireCategoryApi({
        equipmentTypeId: equipmentTypeId as string,
        token: token as string,
      }),
    enabled: !!token && !!equipmentTypeId, // only run when both are available
  });
};
