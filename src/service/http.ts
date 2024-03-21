import axios from 'axios';
import { message } from 'antd'
import { routes } from 'src/pages/routers'
import qs from 'qs';
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
    console.log(config.headers['Content-Type'],'x==')
    if(config.method === 'post') {
        config.data = qs.stringify(config.data);
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }


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

// 添加响应拦截器
instance.interceptors.response.use(
  function (response:AxiosResponse<ApiResponse>) {
    // 对响应数据做点什么
    if (response.data.code === 996 || response.data.code === 1) {
      routes.navigate('/login')
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