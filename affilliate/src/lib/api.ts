import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4545";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
