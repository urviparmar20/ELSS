export function mapRawBDC(raw: any) {
  if (!raw) return null;

  console.log('raw',raw);
  
  return {
    equipmentTypeName: raw.equipment_type || "",
    equipmentName: raw.equipment || "",
    
    equipmentTypeId: raw.equipment_type_id || "",
    equipmentId: String(raw.equipment ?? ""),
   
    ch_date: raw.ch_date || "",
    location: raw.location || "",
    complied: raw.complied || "",
    replace_parts: raw.replace_parts || "",
    status: raw.status || "",
    bdc_id: raw.id || "",
    login_time: raw.login_time || "",
    logout_time: raw.logout_time || ""
   
  }

}