import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getGeneralChecklistApi } from "../api/generalChecklist";

export const useGeneralChecklist = (equipmentTypeId?: string) => {
  const token = useSelector((state: RootState) => state.auth.token);

  return useQuery({
    queryKey: ["general-checklist", equipmentTypeId],
    queryFn: () =>
      getGeneralChecklistApi({
        equipmentTypeId: equipmentTypeId as string,
        token: token as string,
      }),
    enabled: !!token && !!equipmentTypeId,
  });
};
