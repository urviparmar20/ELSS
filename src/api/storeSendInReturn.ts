import apiV2 from "./apiV2";

export const storeSendInReturnApi = async ({
  token,
  flag,
  formData,
}: {
  token: string;
  flag: string;
  formData: FormData;
}) => {
  const endpoint =
    flag === "needToReturn"
      ? "/send-in-return/return/store"
      : "/send-in-return/store";
      
  const response = await apiV2.post(endpoint, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};