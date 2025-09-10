// src/utils/auth.js
export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || null;
