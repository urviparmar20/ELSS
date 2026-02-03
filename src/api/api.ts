import axios from "axios";

const api = axios.create({
  baseURL: "https://alpineelss.seatrium.com/api/v1",
  // baseURL: "http://elss.devwebproject.com/api/v1",
  timeout: 60000,
});

// api.interceptors.request.use((req) => {
//   console.log("➡️ REQUEST", {
//     method: req.method,
//     url: `${req.baseURL ?? ""}${req.url}`,
//     data: req.data,
//     headers: req.headers,
//   });
//   return req;
// });

// api.interceptors.response.use(
//   (res) => {
//     console.log("✅ RESPONSE", {
//       status: res.status,
//       url: `${res.config.baseURL ?? ""}${res.config.url}`,
//       data: res.data,
//     });
//     return res;
//   },
//   (err) => {
//     console.log("❌ ERROR", {
//       status: err.response?.status,
//       url: err.config ? `${err.config.baseURL ?? ""}${err.config.url}` : undefined,
//       data: err.response?.data,
//     });
//     return Promise.reject(err);
//   }
// );


export default api;
