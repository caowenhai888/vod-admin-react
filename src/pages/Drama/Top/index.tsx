import  { useEffect, useState } from 'react';
import { Space,Table, Button, Modal, Form, Input,InputNumber, message,Card,Select,Popconfirm } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useAntdTable,useRequest } from 'ahooks'
import { http } from 'src/service';
import { baseUrl } from 'src/service/http';
import axios from 'axios'

const instance = axios.create({
    baseURL: baseUrl,
    timeout: 10000,
    headers: {
      Accept: 'application/json;charset=utf-8',
      'Content-Type': 'application/json;charset=utf-8',
    }
});
import { isEmpty,find } from 'lodash';
const { Option } =Select


const getTableData = ({ current, pageSize }): Promise<any> => {
    return http.get(`/rank/getRankList?`)
      .then((res) => ({
        list: res.data.data,
    }));
}

const  api =  ()=> {
    return http.get('/rank/getRankDrama')
}

  
const TagsTable = () => {
   
    const [selectedTag, setSelectedTag] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [dramaList, setDramaList]= useState<any>([])
    const [form] = Form.useForm();
    const { tableProps, refresh } = useAntdTable(getTableData )
    const [selectedDramaIds, setSelectedDramaIds] = useState<any>([]);

    const {} = useRequest(api, {
        onSuccess(res) {
            if(res.data.code === 0){
                setDramaList(res.data.data)
            }
           
        }
    })
   
    const columns = [
        {
            title: 'ID',
            dataIndex: 'rankId',
            width: 80,
        },
        {
            title: '排行榜类型',
            dataIndex: 'rankName',
        },
        {
            title: '剧集列表',
            dataIndex: 'dramas',
            render: (text, record) => {
                return (
                    <div style={{ maxHeight:"80px", overflowY:"scroll"}}>
                        {record?.drama?.map(item => <p key={item.dramaId}>剧集名称：{item.dramaName}-剧集积分:{item.dramaScore}</p>)}
                    </div>
                )
            }
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

    useEffect(() => {
        if(isEmpty(selectedTag)){
            form.setFieldValue('rankId', 0)
        } else {
            form.setFieldsValue(selectedTag)
        }
    },[selectedTag]) 

    async function handleFinish(values) {
        console.log('Received values of form:', values);
        // 在此处处理values
    }
        
    
    
    const handleEditButton = (record) => {
        setSelectedTag(record);
        setModalVisible(true);
        form.setFieldsValue(record);
    };
    
    const handleDeleteButton = async (record) => {
        let response = await http.post('/rank/deleteRank', { rankId: record.rankId });
      
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
        if(isEmpty(values.drama)){
            return message.warning('剧集不能为空')
        }
        const url = '/rank/updateRankList';
            
        const res = await instance.post(url, {
            ...values, 
            drama:values?.drama?.map(item=>({
                    ...item, 
                    dramaName: find(dramaList, { dramaId: item.dramaId })?.dramaName
                })),
        });

        if(res.data.code === 0 ) {
            form.resetFields();
            setModalVisible(false);
            setSelectedTag(null);
           
            refresh();
            setSelectedDramaIds([])
            message.success('操作成功');
        }
        
        } catch (error) {
            console.log(error, 'error-')
        }
    };
    const updateSelectedDramas = (dramaId, operation) => {
        let updatedDramas = [...selectedDramaIds];
        
        if (operation === 'add') {
            updatedDramas.push(dramaId);
        } else if (operation === 'remove') {
            updatedDramas = updatedDramas.filter(id => id !== dramaId);
        }
        
        setSelectedDramaIds(updatedDramas);
    };

    return (
        <Card title={
            <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => 
                {
                    setSelectedTag(null);
                    setModalVisible(true)
                }}>
                新增
            </Button>
        }>
            <Table 
                bordered 
                columns={columns} 
                {...tableProps}
                rowKey="tag_id" 
            />
       
            <Modal
                title={selectedTag ? '编辑' : '新增'}
                open={modalVisible}
                width={'40%'}
                destroyOnClose ={ true}
                onOk={handleModalSubmit}
                onCancel={() => {
                    setSelectedTag(null)
                    form.resetFields();
                    setSelectedDramaIds([]); setModalVisible(false)
                }}
            >
                <div className='form-box'>
                <Form labelCol={{ span: 5 }} form={form} onFinish={handleFinish} autoComplete="off">
                    {/* <Form.Item name="rankId" label="榜单 ID"   rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                     */}
                    <Form.Item name="rankName" label="榜单名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item hidden name="rankId" >
                        <Input  />
                    </Form.Item>

                    <Form.List name="drama" >
                        {(fields, { add, remove }) => (
                        <>
                            {fields.map(field => (
                                    <Form.Item key={field.key} label="剧集"  >
                                        <Input.Group  compact>
                                         
                                            <Form.Item 
                                                noStyle
                                                rules={[{ required: true }]}
                                                name={[field.name, 'dramaId']} 
                                            >
                                                <Select 
                                                      onChange={(selectedId) => {
                                                        updateSelectedDramas(selectedId, 'add');
                                                      }}
                                                      onDeselect={(deselectedId) => {
                                                        updateSelectedDramas(deselectedId, 'remove');
                                                      }}
                                                    style={{width:"45%", marginRight:"10px"}} 
                                                    placeholder="选择剧集" >
                                                    {dramaList.map(drama => <Option 
                                                        disabled={selectedDramaIds.includes(drama.dramaId)}
                                              
                                                        key={drama.dramaId} 
                                                        value={drama.dramaId}>{drama.dramaName}</Option>)}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item 
                                                  rules={[{ required: true }]}
                                                name={[field.name, 'dramaScore']} 
                                            >
                                                <InputNumber min={0} placeholder="积分"  />
                                            </Form.Item>
                                            <MinusCircleOutlined style={{ alignItems:"center", fontSize:"20px",display:"inline-block", marginTop:"5px", marginLeft:"5px"}} onClick={() => remove(field.name)} />
                                        
                                            </Input.Group>
                                    </Form.Item>
                               
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add field
                                </Button>
                            </Form.Item>
                         
                        </>
                        )}
                    </Form.List>
                </Form>
                </div>
            </Modal>
        </Card>
    );
};

export default TagsTable;