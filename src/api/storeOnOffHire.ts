const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL
export const storeOnOffHireApi = async ({
  token,
  hireType,
  formData,
}: {
  token: string;
  hireType: string;
  formData: FormData;
}) => {
  
  const endpoint = hireType == "ON" ? "/on-hire/store": "/off-hire/store";
  console.log('hireType',hireType, endpoint);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });
console.log('response',response);

  if (!response.ok) {
    const text = await response.text();
    
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};
