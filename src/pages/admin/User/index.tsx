import React, { useEffect, useState } from 'react';
import { Space,Table, Button, Modal, Form, Input, message,Card,Select,Popconfirm } from 'antd';
import { PlusOutlined,EditOutlined,EyeFilled } from '@ant-design/icons';
import { useAntdTable, useAsyncEffect } from 'ahooks'

import { http } from 'src/service';
import { isEmpty } from 'lodash';
import dayjs from 'dayjs'

const { Option } =Select
const getTableData = ({ current, pageSize }): Promise<any> => {
    return http.get(`/sys/userData?rid=-1`)
      .then((res) => ({
        total: res.data.count,
        list: res.data.data,
      }));
};
  
const TagsTable = () => {
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [resetState, setResetState] = useState(false);
    const [uid, setUid] = useState('');
    
    const [ roleList, setRoleList] = useState<any>([])
    const [form] = Form.useForm();
    const resetForm = Form.useForm();
   
    const { tableProps, refresh } = useAntdTable(getTableData )

    useAsyncEffect(async() => {
        http.post('/sys/roleData').then(res => {
            if(res.data.code === 0) {
                setRoleList(res.data.data)
            }
        }).catch(error => {

        })
    },[])

    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };

    const handleResetButton = (record) => {
        setUid(record.id)
        setResetState(true)
    }

    // defaultValue 设置默认值
    const columns = [
          {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
          },
          {
            title: '登录名',
            dataIndex: 'username',
            key: 'username',
          },
          {
            title: '姓名',
            dataIndex: 'real_name',
            key: 'real_name',
          },
          {
            title: '邮箱',
            dataIndex: 'email',
            key: 'email',
          },
          {
            title: '角色',
            dataIndex: 'role_id',
            key: 'role',
            render(text){
                return !isEmpty(roleList) && roleList.find(item => item.id === text )['role_name']
            }
            
          },
          {
            title: '加入时间',
            dataIndex: 'create_time',
            key: 'create_time',
            render(create_time) {
                return dayjs(create_time*1000).format('YYYY-MM-DD')
            }
            
          },
        {
            title: '操作',
            key: 'action',
            with: 180,
            render: (_, record) => (
                <Space>
                    <Button size="small"  type="primary" icon={<EyeFilled />} onClick={() => handleResetButton(record)}>重置密码</Button>
                    <Button size="small" disabled={true} type="primary" icon={<EditOutlined />} onClick={() => handleEditButton(record)}>编辑</Button>
                    <Popconfirm
                        title="确认删除"
                        description="确定删除该菜单吗？"
                        onConfirm={() => handleDeleteButton(record)}
                        
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                                danger
                                size="small" 
                                type="primary"
                                disabled={true}
                            >
                                删除
                            </Button>
                    
                    </Popconfirm>
                </Space>
            ),
        },
    ]; 

    
    
    const handleDeleteButton = async (record) => {
        let response = await http.post('/sys/deleteMenu', { ids: record.id });
      
        if (response.data.code === 0) {
            message.info('删除成功');
            refresh();
        } else {
            message.error('删除失败');
        }
    };
      
    const handleModalSubmit = async() => {
        try {
            
        
        const values = await form.validateFields()
        const url = selectedTag ? '/sys/updateMenu' : '/sys/updateUser';
            
        const res = await http.post(url, {...values, uid:-1}) ;
        if(res.data.code === 0 ) {
            form.resetFields();
            setModalVisible(false);
            setSelectedTag(null);
            refresh();
            message.success('操作成功');
        }
        
        } catch (error) {
            console.log(error, 'error-')
        }
    };

    const handleReModalSubmit = async() => {
        try {
            const values = await resetForm[0].validateFields()
            const res = await http.post('/sys/resetUserPassword', {...values, uid}) ;
            if(res.data.code === 0 ) {
                resetForm[0].resetFields();
                setResetState(false);
                setUid('')
                message.success('操作成功');
            }
            
        }catch (error) {
            console.log(error)
        }

    }

    return (
        <Card title={
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setModalVisible(true)}
            >
                新增用户
            </Button>
        }>
            <Table 
                bordered 
                columns={columns} 
                dataSource={tableProps.dataSource}
                pagination={{ pageSize:100}}
                rowKey="tag_id" 
            />
            <Modal open={resetState} title={'重置密码'} onOk={handleReModalSubmit}  onCancel={() => setResetState(false)}>
                <Form 
                    form={resetForm[0]}
                    layout="horizontal"
                   
                    labelCol={{span:4}}>

                        <Form.Item
                            label="密码"
                            name="password"
                            rules={[ {  required: true } ]}
                            >
                            <Input.Password placeholder="请输入密码" />
                        </Form.Item>

                        <Form.Item
                            label="密码确认"
                            name="repassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: '请再次输入密码' },
                                ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次密码输入不一致'));
                                },
                                }),
                            ]}
                            >
                            <Input.Password placeholder="请再次输入密码" />
                        </Form.Item>
                        
                </Form>
            </Modal>
       
            <Modal
                title={selectedTag ? '编辑用户' : '新增用户'}
                open={modalVisible}
                
                onOk={handleModalSubmit}
                onCancel={() => setModalVisible(false)}
            >
                <div className='form-box'>
                    <Form 
                        form={form}
                        layout="horizontal"
                        labelCol={{span:4}}
                    >
                        <Form.Item
                            label="登录名"
                            name="username"
                            rules={[{ required: true,  message: '请输入用户名' }]}
                            >
                            <Input placeholder="请输入用户名" />
                            </Form.Item>

                            <Form.Item
                            label="密码"
                            name="password"
                            rules={[
                                { 
                                required: true, 
                                }
                            ]}
                            >
                            <Input.Password placeholder="请输入密码" />
                            </Form.Item>

                            <Form.Item
                            label="密码确认"
                            name="repassword"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: '请再次输入密码' },
                                ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('两次密码输入不一致'));
                                },
                                }),
                            ]}
                            >
                            <Input.Password placeholder="请再次输入密码" />
                            </Form.Item>

                            <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[{ type: 'email',required: true, message: '请输入正确的邮箱格式' }]}
                            >
                            <Input placeholder="请输入邮箱"/>
                            </Form.Item>

                            <Form.Item
                            label="姓名"
                            name="realname"
                            rules={[{ required: true, message: '请输入真实姓名' }]}
                            >
                            <Input placeholder="请输入真实姓名" />
                            </Form.Item>

                            {/* 角色选项应该根据你的实际数据源进行调整 */}
                            <Form.Item
                            label="角色"
                            name="roleId"
                            rules={[{ required: true, message: '请选择角色' }]}
                            >
                            <Select 
                                placeholder="请选择角色" 
                               >
                                {!isEmpty(roleList) && roleList.map(item => 
                                        <Option  
                                            key={item.id}  
                                            value={item.id}>{item.role_name}</Option>
                                        )}
                            </Select>
                            </Form.Item>

                            <Form.Item
                            label="具体描述"
                            name="remark"
                            >
                            <Input.TextArea placeholder="请输入具体描述"></Input.TextArea>
                            </Form.Item>
                    </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;