import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { onOffHireListApi } from "../api/onOffHires";

export const useOnOffHires = (page: number) => {
  
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);
  
  return useQuery({
    queryKey: ['on-off-hire-list', userId, page],
    queryFn: async () => {
      
      return onOffHireListApi({
        userId: userId as number,
        page,
        token: token as string,
      });
    },
    enabled: !!token && !!userId,
  });
};




