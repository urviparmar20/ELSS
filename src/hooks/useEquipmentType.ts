import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getEquipmentTypeListApi } from "../api/equipmentType";

export const useEquipmentTypeList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useQuery({
    queryKey: ["equipment-type-list", userId],
    queryFn: () =>
      getEquipmentTypeListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId,
  });
};
