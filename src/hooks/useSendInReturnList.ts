import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { sendInReturnsListApi } from '../api/sendInReturns';

export const useSendInReturnList = (page: number) => {
  
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);
  
  return useQuery({
    queryKey: ['send-in-return-list', userId, page],
    queryFn: async () => {
      
      return sendInReturnsListApi({
        userId: userId as number,
        page,
        token: token as string,
      });
    },
    enabled: !!token && !!userId,
  });
};




