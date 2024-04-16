import React, { useState, useEffect } from 'react';
import { Space,Table, Button, Modal, Form, Input, message,Card,Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SketchPicker } from 'react-color';
import { useAntdTable } from 'ahooks'
import { debounce} from 'lodash'

import { http } from 'src/service';
export const getTableData = ({ current, pageSize, name }): Promise<any> => {
    const query = `page=${current}&size=${pageSize}&name=${name}`;
    return http.get(`/videoErase/getEraseTagList?${query}`)
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
    const [name, setName] = useState('')

    const { tableProps, refresh } = useAntdTable((parms)=>getTableData({...parms, name}), {
        refreshDeps:[name]
    })
  
    // defaultValue 设置默认值
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
        },
        {
            title: '名称',
            dataIndex: 'name',
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
                    description="确定删除该条吗？"
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

    
    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };
    
    const handleDeleteButton = async (record) => {
        let response = await http.post('/videoErase/delEraseTag', { id: record.id });
      
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
        const url = selectedTag ? '/videoErase/editEraseTag' : '/videoErase/createEraseTag';
            
        const res = await http.post(url, {...values, id:selectedTag?.id }) ;
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

    const debouncedChangeHandler = debounce((value) => {
        setName(value);
      }, 300); // 存为

    return (
        <Card bordered={false} title={
            <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setModalVisible(true)}
                >
                    新增分类
                </Button>
                 <Input placeholder='搜索名称' allowClear onChange={(e) => debouncedChangeHandler(e.target.value)} />
            </Space>
          

           
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
                            name="name"
                            label="分类名称"
                            rules={[
                            {
                                required: true,
                                message: '请输入分类名称',
                            },
                            ]}
                        >
                            <Input placeholder="请输入分类名称" />
                        </Form.Item>
                    
                        
                    </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;