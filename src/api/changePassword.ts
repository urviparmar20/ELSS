import api from "./api";

interface ChangePasswordParams {
  userId: number;
  password: string;
  token: string;
}

export const changePassword = async ({ userId, password, token }: ChangePasswordParams) => {
  try {
    const response = await api.post(
      "/password/change",
      { 
        user_id: userId,
        password
      },
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;

  } catch (error) {
    console.log("API ERROR:", error);
    throw error;
  }
};
