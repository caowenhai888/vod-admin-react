import Ract, { useState, useRef } from 'react'
import {  Popconfirm, Button, Modal, Switch, Upload, message, Space, Form, InputNumber } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAntdTable } from 'ahooks'
import { http } from 'src/service'
import UploadVideo from './UploadVideo'
/* eslint-disable */
import OSS from 'src/lib/aliyun-oss-sdk-6.17.1.min'
import 'src/lib/aliyun-upload-sdk-1.5.6.min.js'
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import Players from './Player'
import { isEmpty } from 'lodash';


(window as any).OSS = OSS;
const { Dragger } = Upload;


const getTableData = (props) => {

    const { current, pageSize, dramaId } = props
    return http.get('/series/videoList', {
        params: {
            page: current,
            size: 1000,
            dramaId
        }
    }).then(res =>  {
        if(res.data.code === 0 ) {
            return {
                total: res.data.count,
                list: res?.data?.data.map(item => ({
                    ...item,
                    free: String(item.free),
                    vaild: String(item.vaild),
                    shared: String(item.shared)
                })),
            }
        }
        return {
            total: 0,
            list: [],
        }
        
    });
};
interface Props {
    visible: boolean
    onCancel?: () => void
    resetList: () => void
    record:any
}

const UploadCom: Ract.FC<Props> = ({ visible, onCancel, resetList,record }) => {
    const dramaId = record.id
    const actionRef = useRef<ActionType>();
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
    const { tableProps, refresh } = useAntdTable((params) => getTableData({ ...params, dramaId }), { refreshDeps: [dramaId] });
    const [isModalOpen, setModalOpen] = useState(false)
    const [options, setOptions] = useState<any>({})
    const [selectedRowKeys, setSelectedRowKeys] = useState<any>([])
    
    const [form]  = Form.useForm()
    
    const handleDelVideo = (drama_id,videoId) => {
        http.post('/series/delVideo',{
            dramaId : drama_id,
            videoId: videoId
            
        }).then(res => {
            if(res.data.code === 0) {
                message.success('操作成功')
                refresh()
            }
        })
    };
   
    const onVideo = (record) => {
        setOptions(record)
    }

    const handleEditVideo = (videoId) => {
        http.post('/video/eraseVideo',{videoId}).then(res => {
            if(res.data.code === 0) {
                message.success('操作成功')
                refresh()
            }
        })

    }
 
    const columns: ProColumns<any>[] = [
      
        { title: '视频ID', dataIndex: 'video_id', width: 120, readonly:true, copyable: true, ellipsis: true,fixed: 'left',  },
        { title: '排序值',   dataIndex: 'idx', width: 120 },
        { title: '名称',   dataIndex: 'name', width: 220,  ellipsis: true},
        { title: '价格', valueType:"money", dataIndex: 'price', width: 120, },
        { title: '大小', dataIndex: 'size', valueType:"text",width: 120 },
        { title: '点赞数', dataIndex: 'like_count', valueType:"text",width: 120 },

        {
            title: '是否免费',
            dataIndex: 'free',
            valueType: "select",
            width: 120 ,
            valueEnum: {
                'true': { text: '是'  },
                'false': { text: '否' },
            },
            render:(text, record)=>{
                return <Switch checked={record.free === 'true'} />
            }
           
        },
        {
            width: 120 ,
            title: '是否开启',
            dataIndex: 'vaild',
           
            valueType: "select",
          
            valueEnum: {
                'true': { text: '是'  },
                'false': { text: '否' },
            },
            render: (text, record) => (
                <Switch checked={record.vaild === 'true'} />
               
            )
        },
        {
            width: 120 ,
            title: '是否分享',
            dataIndex: 'shared',
          
            valueType: "select",
          
            valueEnum: {
                'true': { text: '是'  },
                'false': { text: '否' },
            },
            render: (text, record) => (
                <Switch checked={record.shared === 'true'} />
            )
        },
        
        // { 
        //     title: '擦除状态', 
        //     width: 110, 
        //     readonly:true,
        //     dataIndex: 'erase_status', 
        //     valueEnum: {
        //         0: { text: '未擦除', status: 'Default' },
        //         1: { text: '擦除中', status: 'Processing' },
        //         3: { text: '擦除完成', status: 'Success' },
        //         2: { text: '异常', status: 'Error' },
        //       },
        // },
        // { title: '擦除任务ID', width: 110, readonly:true, dataIndex: 'erase_job_id', ellipsis: true },
        // { title: '擦除后视频ID', width: 120, readonly:true, dataIndex: 'erase_video_id：',tooltip:true,  ellipsis: true },
        // { title: '擦除后视频URL', width: 130, readonly:true, dataIndex: 'erase_video_url', tooltip:true, ellipsis: true },
        // { title: '错误信息', width: 120, readonly:true, dataIndex: 'erase_progress_status', tooltip:true, ellipsis: true },
        
        { title: '上传时间', valueType:"date", width: 110, readonly:true, dataIndex: 'create_time', ellipsis: true },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            fixed: 'right',
            width: 170,
            render: (text, record, _, action) => [
                <Button size="small" onClick={() => onVideo(record)} type="primary"> 预览 </Button>,
                <a
                  key="editable"
                  onClick={() => {
                    action?.startEditable?.(record.id);
                  }}
                >
                   <Button size="small" type="primary"> 编辑 </Button> 
                  
                </a>,
                <a target="_blank" rel="noopener noreferrer" key="view">
                  <Popconfirm
                        title="确认删除"
                        description="确认删除剧集么？"
                        onConfirm={() => handleDelVideo(record.drama_id,record.video_id)}
                        okText="Yes"
                        cancelText="No"
                    >
                           <Button size="small" danger type="primary"> 删除 </Button> 
                    </Popconfirm>
                </a>,
                // <Popconfirm
                //     title="确认编辑"
                //     description="确认编辑视频该么？"
                //     onConfirm={() => handleEditVideo(record.video_id)}
                //     okText="Yes"
                //     cancelText="No"
                // >
                //     <Button disabled={ record.erase_status !== 0} size="small"  type="primary"> 视频擦除 </Button>
                // </Popconfirm>
               
              ],
            
        },
    ];


    // 清空数据
    const handleCancel = () => {
        onCancel && onCancel();
    };
    const handleSubmit = () => {
        onCancel && onCancel();
    }

   
    const onBatch = async() => {
        try {
            await form.validateFields().then(value => {
                const { price } = value
                if(isEmpty(selectedRowKeys)) return
              
                http.post('/series/editDramaPrice',{
                    ids:selectedRowKeys.join(),
                    price
                }).then(res => {
                    if(res.data.code === 0 ) {
                        message.success('操作成功')
                        setSelectedRowKeys([])
                        form.resetFields()
                        refresh()
                    }
                })
            })
        } catch (error) {
            console.log(error, 'error')
        }
    }
    const onBatchDel = () => {
        http.post('/series/batchDelVideo',{
            videoIds:selectedRowKeys.join(),
        }).then(res => {
            if(res.data.code === 0 ) {
                message.success('操作成功')
                setSelectedRowKeys([])
                form.resetFields()
                refresh()
            }
        }).catch(error => {

        })
    }
    return (
        <Modal width={"80%"} open={visible} title="添加剧集" onCancel={handleCancel} onOk={handleSubmit}>

            <Players record={options} open={isModalOpen} setModalOpen={ setModalOpen } />
            <div style={{height:"30px"}}></div>
            <UploadVideo options={record} refresh ={ refresh} />
            <div style={{height:"30px"}}></div>
            {
                !isEmpty(selectedRowKeys) && 
                <div style={{ padding: "0 0 20px 0"}}>
                    <Space>
                        <Form  form={form}>
                            <Form.Item noStyle name={"price"}  rules={[
                                    {
                                        required: true,
                                        message: '请输入价格',
                                    },
                                ]} >
                                <InputNumber min={0}  style={{ width:180}} placeholder='批量修改价格' />
                            </Form.Item>
                        </Form>
                        <Button onClick={ () => onBatch()} type="primary">提交</Button>
                      
                        <Popconfirm
                            title="确认删除"
                            description="确认删除么？"
                            onConfirm={() => onBatchDel()}
                            okText="Yes"
                            cancelText="No"
                        >
                             <Button danger >删除</Button>
                        </Popconfirm>
                    </Space>
                </div>
            }
            <ProTable
                style={{ width:"100%"}}
                actionRef={actionRef}
                bordered
                search={false}
                toolBarRender={false}
                rowSelection={{
                    selectedRowKeys,
                    type: "checkbox",
                    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
                        setSelectedRowKeys(selectedRowKeys)
                    }
                }}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onSave: async (rowKey, data, row) => {
                      const obj:any = {}
                      obj.free =  data.free === 'true';
                      obj.vaild =  data.vaild === 'true';
                      obj.shared =  data.shared === 'true';
                      obj.dramaId = data.drama_id;
                      obj.videoId = data.video_id;
                      obj.idx = data.idx;
                      obj.size = data.size;
                      obj.fileName = data.name;
                      obj.price= data.price
                      obj.like_count = data.like_count
                      
                      http.post('/series/editVideo', {...obj}).then(res => {
                        if(res.data.code === 0) {
                            message.success('操作成功')
                            refresh()
                        }
                        actionRef.current?.reload()
                      })
                     
                    },
                    onChange: setEditableRowKeys,
                    actionRender: (row, config, defaultDom) => {
                        return [
                          <Button size="small" type="primary"> {defaultDom.save} </Button>,
                          defaultDom.cancel,
                          ,
                        ];
                      },
                  }}
                columns={columns}
                { ...tableProps}
                scroll={{ x: 1300 }}
                pagination = {{...tableProps.pagination,  showTotal: false, pageSize:1000, hideOnSinglePage:true}}
                rowKey="id"
            />
        </Modal>

    )
}
export default UploadCom