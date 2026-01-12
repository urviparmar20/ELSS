import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../api/auth';

export const useLogin = () =>
  useMutation({
    mutationFn: loginApi,
  });
