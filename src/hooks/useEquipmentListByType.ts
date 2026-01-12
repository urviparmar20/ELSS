import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getEquipmentListByTypeApi } from "../api/equipmentListByType";

export const useEquipmentListByType = (equipmentTypeId?: string) => {
  const token = useSelector((state: RootState) => state.auth.token);

  return useQuery({
    queryKey: ["equipment-list-by-type", equipmentTypeId],
    queryFn: () =>
      getEquipmentListByTypeApi({
        equipmentTypeId: equipmentTypeId as string,
        token: token as string,
      }),
    enabled: !!token && !!equipmentTypeId, // only run when both are available
  });
};
