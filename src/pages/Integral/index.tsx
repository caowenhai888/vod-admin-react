import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { http } from 'src/service/';

const GoldForm = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const { userId,count } = values
    http.post('/gm/addGold', {
        userId: userId,
        count: count,
    }).then(res => {
       if( res.data.code === 0){
         message.success('操作成功！')
       
       }
    }).finally(() => {
        setLoading(false);
    })
  };

  const onFinishFailed = (errorInfo) => {
    console.error('表单验证失败:', errorInfo);
  };

 

  return (
    <Card>
        <div style={{ width:'60%'}}>
        <Form
            name="gold_form"
            initialValues={{ userId: '', count: 0 }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            labelCol={{span:4}}
            >
            <Form.Item
                label="用户ID"
                name="userId"
            
                rules={[{ required: true, message: '请输入用户ID' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="积分数量"
                name="count"
                rules={[{ required: true, message: '请输入积分数量' }]}
            >
                <Input type="number" />
            </Form.Item>

                <Form.Item style={{textAlign:"right"}}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                    提交
                    </Button>
                </Form.Item>
        </Form>
        </div>
    </Card>

  );
};

export default GoldForm;
