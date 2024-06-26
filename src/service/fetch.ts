import axios from 'axios';
import { message } from 'antd'
import { routes } from 'src/pages/routers'
import type { AxiosResponse } from 'axios'
export const baseUrl =  process.env.REACT_APP_API_URL 
type ApiResponse = {
    code: number;
    data: Record<string, unknown>;
    msg: string;
    count: number;
};
// 创建axios实例
const instance = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json;charset=utf-8',
    'Content-Type': 'application/json;charset=utf-8',
  }
});

// 添加请求拦截器
instance.interceptors.request.use(
  function (config) {

    // 在发送请求之前做些什么
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
let isMessageShowing = false;

// 添加响应拦截器
instance.interceptors.response.use(
  function (response:AxiosResponse<ApiResponse>) {
    // 对响应数据做点什么
    if (response.data.code === 996 || response.data.code === 1) {
        if (!isMessageShowing) {
            isMessageShowing = true;
            message.error(response.data.msg);
            setTimeout(() => isMessageShowing = false, 3000);  
            routes.navigate('/login')
        }
    }
    // if(response.data.code === 0 && !response.data.data ) {
    //     message.error(response.data.msg)
    //     throw new Error(response.data.msg)
    // }
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default instance;