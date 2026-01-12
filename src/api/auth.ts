import api from './api';

export const loginApi = async ({
  employeeId,
  password,
}: {
  employeeId: string;
  password: string;
}) => {
  const response = await api.post('/auth/login', {
    employee_id: employeeId,
    password,
  });

  return response.data;
};
