import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { pastSRListApi } from "../api/pastSR";

export const usePastSRList = (page: number) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useQuery({
    queryKey: ["past-service-reports", userId, page],
    enabled: !!token && !!userId,
    retry: false,
    queryFn: async () => {
      const raw = await pastSRListApi({
        userId: userId as number,
        page,
        token: token as string,
      });
      
      const reportsArray = raw?.data?.serviceReports ?? [];
      console.log('reportsArray',reportsArray);


      // Merge UI fields with full raw object
      const items = reportsArray.map((item: any) => ({
        id: item.id,
        companyName: item.company_name,
        mcSerialNo: item.type,
        equipmentTypeName: item.equipment_type,
        createdAt: item.filled_date || "",
        status: item.is_pending === "Y" ? "pending" : "completed",

        raw: item, // full backend row
      }));

      return items;
    },
  });
};

