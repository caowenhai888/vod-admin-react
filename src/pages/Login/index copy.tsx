import React, { Fragment, useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

import { http } from 'src/service/'
import { useNavigate } from 'react-router-dom'
import { routes } from 'src/pages/routers'
import LottieView from './LottieView'
import { relative } from 'path';

const NormalLoginForm = () => {
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
            Navigate('/home')
        }
    };
  
    return (
        <div style={{ position:"relative"}}>
           
            <div className='lottie'>
            <LottieView />
            </div>
           
            <div className='login'>
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
                    </Form.Item>
            
                    <Form.Item>
                        <Button size="large" style={{ width:"100%"}} type="primary" htmlType="submit" className="login-form-button">
                            登录
                    </Button>
                    </Form.Item>
             </Form>
            </div>
        </div>
      
      
  
    );
};

export default NormalLoginForm;