import api from "./api";

interface GenerateOTPParams {
  userId: number;
  contactNo: string;
  token: string;
}

export const generateOTPSR = async ({ userId, contactNo, token }: GenerateOTPParams) => {
  try {
    const response = await api.post(
      "/service-report/sms",
      { 
        temp_id: userId,
        contact_no: contactNo
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
    console.log("API ERROR (OTP SR):", error);
    throw error;
  }
};
