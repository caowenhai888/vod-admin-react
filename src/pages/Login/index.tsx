import React, { Fragment, useEffect, useState } from 'react';
import LottieView from './LottieView';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { http } from 'src/service/'
import { useNavigate } from 'react-router-dom'
import './style.less';
import './index.css'

const Login = () => {
    const [form] = Form.useForm();
    const Navigate = useNavigate();
    const onFinish = async (values:any) => {
        let formData = {
            username: values.username,
            password: values.password
        }
  
        const res = await http({
            method: 'post',
            url: '/login',
            data: formData,
        })
        if(res.data.code === 0) {
            Navigate('/series/showList')
        }
    };
  
    return (
        <div className='m-login'>
            <div className='m-login-pro'>
                <div className='m-logo-img '>
                    {/* <img src={logo} className='fl mg-r-10' /> */}
                    {/* <p>助力私域客户增长</p>
                    <p>数据驱动智能营销</p> */}
                </div>
                <div className='m-lottie'>
                    <LottieView />
                </div>
            </div>
            <div className='m-login-box'>
                <Fragment>
                    <h3 className='tc'>欢迎登录短剧管理系统</h3>
                    <p>账号密码登录</p>
                    <div className='m-login-wrap'>
                    <Form
                    form={form}
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                     >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                        >
                        <Input  size="large"prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
                        </Form.Item>
                        <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                        >
                        <Input
                            size="large"
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                        />
                        </Form.Item>
                
                        <Form.Item>
                            <Button size="large" style={{ width:"100%"}} type="primary" htmlType="submit" className="login-form-button">
                                登录
                        </Button>
                        </Form.Item>
                </Form>
                    </div>
                </Fragment>
            </div>
        </div>
    );
};

export default Login;