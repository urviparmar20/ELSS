import apiV2 from "./apiV2";

export const updateSendInApi = async ({
  token,
  formData,
}: {
  token: string;
  formData: FormData;
}) => {
  
  const endpoint = "/send-in-return/update"

  const response = await apiV2.post(endpoint, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
