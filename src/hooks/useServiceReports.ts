import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { serviceReportsListApi } from "../api/serviceReports";

export const useServiceReports = (page: number) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useQuery({
    queryKey: ["service-reports", userId, page],
    enabled: !!token && !!userId,
    retry: false,
    queryFn: async () => {
      const raw = await serviceReportsListApi({
        userId: userId as number,
        page,
        token: token as string,
      });

      const reportsArray = raw?.data?.serviceReports ?? [];

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

