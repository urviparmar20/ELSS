import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { generalMaintenanceListApi } from '../api/generalMaintenance';

export const useGeneralMaintenanceList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  const query = useQuery({
    queryKey: ['general-maintenance', userId],
    queryFn: () =>
      generalMaintenanceListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId,
  });

  // console.log("status", query.status);
  // console.log("isLoading", query.isLoading);
  // console.log("isFetching", query.isFetching);
  // console.log("isError", query.isError);
  // console.log("error", query.error);
  // console.log("data", query.data);

  return query;
};