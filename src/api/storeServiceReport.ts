import { ServiceReportMode } from "../types/serviceReport";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL
export const storeServiceReportApi = async ({
  token,
  formData,
  mode,
}: {
  token: string;
  formData: FormData;
  mode: ServiceReportMode;
}) => {
  
  const endpoint =
    mode === "draft"
      ? "/service-report/draft"
      : "/service-report/store";

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
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  return response.json();
};
