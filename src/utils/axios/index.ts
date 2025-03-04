import axios from "axios";
import { BASE_URL } from "../../api/config";

const createAxiosInstance = (baseURL: string) => {
    const instance = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });

    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return instance;
};
const axiosInstance = createAxiosInstance(BASE_URL);

const userAxiosInstance = createAxiosInstance(`${BASE_URL}/users`);

export { userAxiosInstance };
export default axiosInstance;
