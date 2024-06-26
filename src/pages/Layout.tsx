import { Layout, Menu, Dropdown, Avatar, Skeleton, message } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom'
import {
    UserOutlined
} from '@ant-design/icons';
import React, { useState } from 'react';
import Slider from 'src/pages/Slider'
import { http } from 'src/service'

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

const MyComponent = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigat = useNavigate()
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    const logout = () => {
        http.get('/logout').then(res => {
            if (res.data.code === 0) {
                message.success('退出登录')
                navigat('/login')
            }
        })
    }

    const menu = (
        <Menu>
            <Menu.Item>
                <a target="_blank" rel="noopener noreferrer" href="/user/profile">
                    个人资料
                </a>
            </Menu.Item>
            <Menu.Item>
                <a target="_blank" rel="noopener noreferrer" onClick={() => logout()}>
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
                    right: 0

                }}>
                    <Dropdown overlay={menu} placement="bottomRight">
                        <Avatar style={{ marginRight: 20 }} icon={<UserOutlined />} />
                    </Dropdown>

                </Header>

                <Content
                    className="site-layout-background"
                    style={{
                        padding: '14px 0',
                        margin: '64px 16px 0', // Margin top equals Header height
                        minHeight: 'calc(100vh - 64px)',
                        overflow: 'initial',
                    }}
                >
                    <React.Suspense fallback={<Skeleton />}>
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