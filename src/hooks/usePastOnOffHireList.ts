import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { pastOnOffHireListApi } from '../api/pastOnOffHire';

export const usePastOnOffHireList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  
  return useQuery({
    queryKey: ['past-on-off-hire', userId],
    queryFn: () =>
      pastOnOffHireListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId
  });
};
