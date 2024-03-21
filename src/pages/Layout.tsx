import { Layout, Menu, Breadcrumb, Dropdown, Avatar, Skeleton } from 'antd';
import { Outlet } from 'react-router-dom'
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
  DownOutlined,
} from '@ant-design/icons';
import React, { useState } from 'react';
import Slider from 'src/pages/Slider'
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const MyComponent = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menu = (
    <Menu>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="/user/profile">
          个人资料
        </a>
      </Menu.Item>
      <Menu.Item>
        <a target="_blank" rel="noopener noreferrer" href="/logout">
          登出
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className='layout'>
      <Sider width={200} 
        style={{
          position: 'fixed', 
          height: '100vh', 
          overflow: 'auto', 
          background: '#fff',
          zIndex: 2, 
          }} 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
      >
        <Slider />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header style={{ 
          position: 'fixed', 
          width: '100%', 
          zIndex: 1, 
          background: '#fff', 
          padding: 0, 
          textAlign: 'right',
          right:0
          
        }}>
          <Dropdown overlay={menu} placement="bottomRight">
            <Avatar style={{ marginRight: 20 }} icon={<UserOutlined />} />
          </Dropdown>
         
        </Header>

        <Content
          className="site-layout-background"
          style={{
            padding: 14,
            margin: '64px 16px 0', // Margin top equals Header height
            minHeight: 280,
            overflow: 'initial',
          }}
        > 
            <React.Suspense fallback={ <Skeleton />}>
                <div className='site-layout'>
                    
                <Outlet />
                    
                </div>
            </React.Suspense>
      
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyComponent;