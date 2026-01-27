import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { generalMaintenanceListApi } from '../api/generalMaintenance';

export const useGeneralMaintenanceList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  
  return useQuery({
    queryKey: ['general-maintenance', userId],
    queryFn: () =>
      generalMaintenanceListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId
  });
};
