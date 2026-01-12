import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getCompaniesApi } from '../api/companies';

export const useCompanies = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = useSelector((state: RootState) => state.auth.user?.user_id);

  return useQuery({
    queryKey: ['companies', userId],
    queryFn: () => getCompaniesApi(String(userId), token!),
    enabled: !!userId && !!token,
  });
};
