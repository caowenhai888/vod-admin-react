import Ract, { useState, useRef } from 'react'
import {  Popconfirm, Button, Modal, Switch, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import { useAntdTable } from 'ahooks'
import { http } from 'src/service'
import UploadVideo from './UploadVideo'
/* eslint-disable */
import OSS from 'src/lib/aliyun-oss-sdk-6.17.1.min'
import 'src/lib/aliyun-upload-sdk-1.5.6.min.js'
import type { ActionType, ProColumns } from '@ant-design/pro-components';

(window as any).OSS = OSS;
const { Dragger } = Upload;


const getTableData = (props) => {

    const { current, pageSize, dramaId } = props
    return http.get('/series/videoList', {
        params: {
            page: current,
            size: pageSize,
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
    var player:any = null
    const onVideo = (record) => {
        setOptions(record)
     
        http.post('/series/getVideoPlayAuth',{videoId:record.video_id}).then(res => {
            if(res.data.code === 0) {
                setModalOpen(true)
                setTimeout(() => {
                    if(player) {
                        player.dispose();
                    }
                    player = new (window as any).Aliplayer({
                        id: 'J_prismPlayer',
                        width: '100%',
                        height: '100%',
                        vid : record.video_id,
                        playauth : res.data.playAuth, // 使用获取到的播放凭证
                    },function(player){
                        console.log('The player is created.')
                    });
                }, 0);
            }
        })
    }
 
    const columns: ProColumns<any>[] = [
        {
            title: '排序',
            dataIndex: 'idx',
            width: 80,
        },
        { title: '名称', dataIndex: 'name', width: 120, ellipsis:true, tooltip:true },
        { title: '视频id', dataIndex: 'video_id', width: 120, readonly:true, copyable: true, ellipsis: true },
        { title: '价格', valueType:"money", dataIndex: 'price', width: 80, },
        { title: '大小', dataIndex: 'size', valueType:"text" },
        {
            title: '是否免费',
            dataIndex: 'free',
            valueType: "select",

            valueEnum: {
                'true': { text: '是'  },
                'false': { text: '否' },
            },
            render:(text, record)=>{
                return <Switch checked={record.free === 'true'} />
            }
           
        },
        {
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
        { title: '上传时间', valueType:"date", width: 110, readonly:true, dataIndex: 'create_time', ellipsis: true },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            fixed: 'right',
            width: 180,
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
               
                </a>
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
  
    return (
        <Modal width={"80%"} open={visible} title="添加剧集" onCancel={handleCancel} onOk={handleSubmit}>

           
            <Modal footer={null} width={'80%'} open={isModalOpen} onCancel={() => setModalOpen(false)} >
                    <div style={{ height:"80vh" }} id="J_prismPlayer"></div>
            </Modal>
            <div style={{height:"30px"}}></div>
            <UploadVideo options={record} refresh ={ refresh} />
            <div style={{height:"30px"}}></div>
            <ProTable
                actionRef={actionRef}
                bordered
                search={false}
                toolBarRender={false}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onSave: async (rowKey, data, row) => {
                      console.log(rowKey, data, row);
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
                pagination = {{...tableProps.pagination,  showTotal: false,}}
                rowKey="id"
            />
        </Modal>

    )
}
export default UploadCom