import { BDCStoreParams } from "../types/breakdownCheckout";

export const buildBDCFormData = (
  params: Omit<BDCStoreParams, "token">
) => {
  const formData = new FormData();
  formData.append("bk_id", params.bk_id);

  formData.append("user_id", params.user_id);
  formData.append("equipment_type", params.equipment_type);
  formData.append("equipment_id", params.equipment_id);
  formData.append("location", params.location);
  formData.append("replace_parts", params.replace_parts);
  formData.append("complied", params.complied);
  formData.append("ch_date", params.ch_date);
  formData.append("login_time", params.login_time);
  formData.append("logout_time", params.logout_time);
  formData.append("status", params.status);
  return formData;
};
