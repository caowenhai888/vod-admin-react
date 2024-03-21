import React, { useState, useEffect } from 'react';
import { Space,Table, Button, Modal, Form, Input, message,Card,Popover,Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import { useAntdTable } from 'ahooks'

import { http } from 'src/service';
const getTableData = ({ current, pageSize }): Promise<any> => {
    const query = `page=${current}&size=${pageSize}`;
  
    return http.get(`/tags/tagList?${query}`)
      .then((res) => ({
        total: res.data.count,
        list: res.data.data,
      }));
};
  
const TagsTable = () => {
    const [tagsData, setTagsData] = useState([]);
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const { tableProps, refresh } = useAntdTable(getTableData )
    console.log(tableProps, 'tableProps---')

    // defaultValue 设置默认值
    const columns = [
        {
            title: 'ID',
            dataIndex: 'tag_id',
            width: 80,
        },
        {
            title: '标签名',
            dataIndex: 'tag_name',
        },
        {
            title: '标签描述',
            dataIndex: 'tag_desc',
        },
        {
            title: '颜色',
            dataIndex: 'tag_color',
            render: tag_color => (
                <span style={{ color: tag_color }}>{tag_color}</span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            render: (text, record) => (
                <Space size="middle">
                  <Button 
                      size="small"
                      type="primary" 
                      onClick={() => handleEditButton(record)}
                  >
                      编辑
                  </Button>
               
                  <Popconfirm
                    title="确认删除"
                    description="确定删除该标签吗？"
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

    ;
    
    
    
    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };
    
    const handleDeleteButton = async (record) => {
        let response = await http.post('/tags/delTag', { tag_id: record.tag_id });
      
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
        const url = selectedTag ? '/tags/editTag' : '/tags/createTag';
            
        const res = await http.post(url, {...values, tag_id:  selectedTag?.tag_id }) ;
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
                新增标签
            </Button>
        }>
            <Table 
                bordered 
                columns={columns} 
              
                {...tableProps}
                rowKey="tag_id" 
            />
       
            <Modal
                title={selectedTag ? '编辑标签' : '新增标签'}
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
                        <Form.Item
                            name="tag_name"
                            label="标签名"
                            rules={[
                            {
                                required: true,
                                message: '请输入标签名',
                            },
                            ]}
                        >
                            <Input placeholder="请输入标签名" />
                        </Form.Item>
                        <Form.Item shouldUpdate={(prevValues, curValues) => prevValues.tag_color !== curValues.tag_color}>
                        {() => {
                            return (
                                <Form.Item label="标签颜色">
                                    <Form.Item
                                        name="tag_color"
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input type="hidden" />
                                        <Form.Item noStyle>
                                            <Popover 
                                                placement='right'
                                                    content={ 
                                                    <SketchPicker
                                                        color={form.getFieldValue('tag_color')}
                                                        onChangeComplete={(color) =>
                                                        form.setFieldsValue({ tag_color: color.hex })
                                                        }
                                                    />} 
                                                    title="选择颜色">
                                                    <div style={{
                                                            border:"1px solid red",
                                                            width: 30,
                                                            height: 30,
                                                            backgroundColor: form.getFieldValue('tag_color'),
                                                        
                                                            display: 'inline-block',
                                                        }}></div>
                                                </Popover>
                                            </Form.Item>
                                    </Form.Item>
                                    
                                   
                                    
                                </Form.Item>
                            );
                        }}
                        </Form.Item>

                    
                        <Form.Item
                            name="tag_desc"
                            label="标签描述"
                        >
                            <Input placeholder="请输入标签描述" />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;