import React, { useState } from 'react';
import { Space,Table, Button, Modal, Form, Input, message,Card,InputNumber,Switch,Checkbox,Popconfirm } from 'antd';
import { PlusOutlined,EditOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks'

import { http } from 'src/service';
const getTableData = ({ current, pageSize }): Promise<any> => {
    return http.get(`/sys/menuData`)
      .then((res) => ({
        total: res.data.count,
        list: res.data.data,
      }));
};
  
const TagsTable = () => {
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { tableProps, refresh } = useAntdTable(getTableData, {onError() {

    }} )

    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };
    // defaultValue 设置默认值
    const columns = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '菜单标识', dataIndex: 'menu_name',width: 110},
        { title: '菜单显示名', dataIndex: 'menu_text', with:120},
        { title: '父节点ID', dataIndex: 'parent_id', width: 110 },
        { 
            title: '叶子节点',
            dataIndex: 'is_leaf', 
            render: is_leaf => <Switch checked={is_leaf} disabled />,
            width: 100 
        },  
        { 
            width: 150,
            title: '菜单路径',
            dataIndex: 'menu_path', 
        },
        { title: '排序值', dataIndex: 'sort_order', width: 100 },
        { title: '备注', dataIndex: 'remark'},
        {
            title: '操作',
            key: 'action',
            with: 150,
            render: (_, record) => (
                <Space>
                    <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEditButton(record)}>编辑</Button>
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
        const url = selectedTag ? '/sys/updateMenu' : '/sys/addMenu';
            
        const res = await http.post(url, {...values, mid:  selectedTag?.id, leaf:values.is_leaf === true ? 1 : undefined, is_leaf:undefined }) ;
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

    return (
        <Card title={
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setModalVisible(true)}
            >
                新增菜单
            </Button>
        }>
            <Table 
                bordered 
                columns={columns} 
                dataSource={tableProps.dataSource}
                pagination={{ pageSize:100}}
                rowKey="tag_id" 
            />
       
            <Modal
                title={selectedTag ? '编辑' : '新增'}
                open={modalVisible}
                
                onOk={handleModalSubmit}
                onCancel={() => {
                    setModalVisible(false)
                    setSelectedTag(null)
                    form.resetFields()
                }}
            >
                <div className='form-box'>
                    <Form 
                        form={form}
                        layout="horizontal"
                        initialValues={{ tag_color: '#cb4545' }}
                    >
                            <Form.Item name="menu_name" label="菜单标识" rules={[{ required: true, message: "请输入菜单名称（只能英文下划线）" }]}>
                                <Input placeholder="请输入菜单名称（只能英文下划线）" />
                            </Form.Item>
                            <Form.Item name="menu_text" label="菜单名称" rules={[{ required: true, message: "请输入菜单显示名称" }]}>
                                <Input placeholder="请输入菜单显示名称" />
                            </Form.Item>
                            <Form.Item name="parent_id" label="父节点ID" rules={[{ required: true, message: "请输入父节点ID", type: "number" }]}>
                                <InputNumber placeholder="请输入父节点ID" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="menu_path" label="菜单路径" rules={[{ required: true, message: "请输入菜单路径" }]}>
                                <Input placeholder="请输入菜单路径" />
                            </Form.Item>
                            <Form.Item name="is_leaf" label="叶子节点" valuePropName="checked">
                                <Checkbox />
                            </Form.Item>
                            <Form.Item name="icon_cls" label="图标样式">
                                <Input placeholder="请输入图标样式" />
                            </Form.Item>
                            <Form.Item name="sort_order" label="排序值" rules={[{ required: true, message: "请输入排序值", type: "number" }]}>
                                <InputNumber placeholder="请输入排序值" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item name="remark" label="具体描述">
                                <Input.TextArea placeholder="请添加详细描述" />
                            </Form.Item>
                    </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;