import axios from "axios";

const apiV2 = axios.create({
  // baseURL: "https://alpineelss.seatrium.com/api/v2",

  baseURL: "https://elss.devwebproject.com/api/v2",
  timeout: 60000,
});

export default apiV2;
