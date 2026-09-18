import { useMutation } from "@tanstack/react-query";
import { updateSendInApi } from "../api/updateSendIn";

export const useUpdateSendIn = (token: string) => {
  return useMutation({
    mutationFn: ({
      formData,
    }: {
      formData: FormData;
    }) => {
      if (!token) throw new Error("No token");
      return updateSendInApi({ token, formData });
    },
  });
};
