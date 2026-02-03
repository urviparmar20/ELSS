const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL
export const storeGMApi = async ({
  token,
  formData,
}: {
  token: string;
  formData: FormData;
}) => {
  
  const endpoint = "/general-maintenance/store";

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    console.log('response',response);
    
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};
