import React, { useState } from 'react';
import { Space,Table, Button, Modal, Form, Input, message,Card,TreeSelect,Switch,Checkbox,Popconfirm } from 'antd';
import { PlusOutlined,EditOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAntdTable, useAsyncEffect } from 'ahooks'
import getChildNodeIds from './getChildNodeIds';

import dayjs from 'dayjs'

import { http } from 'src/service';
const { SHOW_PARENT } = TreeSelect;
function transformData(data) {
    return data.map(item => ({
      title: item.title,
      value: item.id,
      key: item.id,
      children: item.children ? transformData(item.children) : [],
    }));
}

const getTableData = ({ current, pageSize }): Promise<any> => {
    return http.get(`/sys/roleData`)
      .then((res) => ({
        total: res.data.count,
        list: res.data.data,
      }));
};
  
const TagsTable = () => {
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [treeData,setTreeData] = useState<any>([])
    const [selectValue, setSelectValue] = useState<any>([]);
    const [form] = Form.useForm();
    const { tableProps, refresh } = useAntdTable(getTableData )

    useAsyncEffect(async () => {
        form.setFieldValue('rolepaths',[91, 88, 89])
       http.post('/sys/roleMenuData?rid=1').then(res => {
        if(res.data.code === 0) {
            console.log(JSON.stringify(transformData(res.data.data)), 'xxx')
            setTreeData(transformData(res.data.data))
        }
       })
    }, [])
    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };
    // defaultValue 设置默认值
    const columns:any[] = [
        { title: 'ID', dataIndex: 'id', width: 60 },
        { title: '角色名', dataIndex: 'role_name', with:120},
        { 
            title: '创建时间', 
            dataIndex: 'create_time',
            with:120,
            render: (text, record) => {
               return dayjs(text * 1000).format('YYYY-MM-DD')
            }
        },
        { title: '具体描述', dataIndex: 'remark', with:120},
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
        let lookup = getChildNodeIds(treeData, 87);

       return console.log(lookup, 'values====')
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
  
    const tProps = {
        treeData,
        treeDefaultExpandAll: true,
        treeCheckable: true,
        showCheckedStrategy: SHOW_PARENT,
        placeholder: 'Please select',
        style: {
          width: '100%',
        },
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
                title={selectedTag ? '编辑菜单' : '新增菜单'}
                open={modalVisible}
                
                onOk={handleModalSubmit}
                onCancel={() => setModalVisible(false)}
            >
                <div className='form-box'>
                    <Form 
                        form={form}
                        layout="horizontal"
                        initialValues={{ tag_color: '#cb4545' }}
                    >
                             <Form.Item name="rolename" label="角色名" rules={[{ required: true, message: '请输入角色名' }]}>
                                <Input placeholder="请输入角色名" />
                            </Form.Item>

                            <Form.Item name="rolepaths" label="权限范围">
                                <TreeSelect {...tProps} />
                            </Form.Item>

                            <Form.Item name="admin" label="管理权限" valuePropName="checked">
                                <Checkbox />
                            </Form.Item>

                            <Form.Item name="descr" label="具体描述">
                                <Input.TextArea placeholder="请添加详细描述" />
                            </Form.Item>
                    </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;