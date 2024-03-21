import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'
import { routes } from './pages/routers'
import './App.css';
dayjs.locale('zh-cn');
dayjs.extend(isBetween)


function App() {
  return (
    <ConfigProvider locale={zhCN}>
        <RouterProvider router={ routes } />
    </ConfigProvider>
       
  );
}

export default App;
