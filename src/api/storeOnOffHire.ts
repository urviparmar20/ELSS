const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL
export const storeOnOffHireApi = async ({
  token,
  flag,
  formData,
}: {
  token: string;
  flag: string;
  formData: FormData;
}) => {
  
  const endpoint = flag == "needToOffHire" ? "/hire/off/store" : "/hire/on/store";
  const baseURL = "https://elss.devwebproject.com/api/v2";
  // const baseURL =  "https://alpineelss.seatrium.com/api/v2";


  const response = await fetch(`${baseURL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};
