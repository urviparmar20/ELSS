import api from "./api";

interface VerifyOTPParams {
  userId: number;
  smsOTP: string;
  token: string;
}

export const verifyOTPSR = async ({ userId, smsOTP, token }: VerifyOTPParams) => {
  try {
    const response = await api.post(
      "/service-report/otp",
      { 
        temp_id: userId,
        sms_otp: smsOTP
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
