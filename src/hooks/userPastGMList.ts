import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { pastGMListApi } from '../api/pastGM';

export const usePastGMList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  
  return useQuery({
    queryKey: ['past-general-maintenance', userId],
    queryFn: () =>
      pastGMListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId
  });
};
