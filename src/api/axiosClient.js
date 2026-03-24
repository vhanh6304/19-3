import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://103.166.183.82:4040/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

// TỰ ĐỘNG GẮN TOKEN: Mỗi khi gọi API, nó sẽ tự vào localStorage lấy token ra
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Trả về data bên trong response
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;