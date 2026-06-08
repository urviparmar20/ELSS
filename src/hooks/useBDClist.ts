import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { bDCListApi } from '../api/breakdownCheckoutlist';

export const useBDCList = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  
  return useQuery({
    queryKey: ['breakdown-checkout-list', userId],
    queryFn: () =>
      bDCListApi({
        userId: userId as number,
        token: token as string,
      }),
    enabled: !!token && !!userId
  });
};
