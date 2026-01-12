import api from "./api";

interface LogoutParams {
  userId: number;
  token: string;
}

export const logoutApi = async ({ userId, token }: LogoutParams) => {
  const response = await api.post(
    "/auth/logout",
    { user_id: userId },
    {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
