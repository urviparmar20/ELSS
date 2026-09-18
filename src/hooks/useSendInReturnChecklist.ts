import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { getSendInReturnChecklistApi } from "../api/sendInReturnChecklist";

export const useSendInReturnChecklist = (equipmentTypeId?: string) => {
  const token = useSelector((state: RootState) => state.auth.token);

  return useQuery({
    queryKey: ["send-in-return", equipmentTypeId],
    queryFn: () =>
      getSendInReturnChecklistApi({
        equipmentTypeId: equipmentTypeId as string,
        token: token as string,
      }),
    enabled: !!token && !!equipmentTypeId, // only run when both are available
  });
};
