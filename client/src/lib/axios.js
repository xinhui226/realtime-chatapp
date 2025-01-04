import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:7100/api",
    withCredentials: true,
});