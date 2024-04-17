import React, { Fragment, useEffect, useState } from 'react';
import { Button, Card, Drawer,Space,Table, message } from 'antd'
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useAntdTable, useRequest } from 'ahooks' 
import { http, baseUrl } from 'src/service'
import UploadVideo from './UploadVideo'
import ClassCom from './Class'
import type { TableColumnsType, TableProps } from 'antd';
type TableRowSelection<T> = TableProps<T>['rowSelection'];
interface Props { }

const getTableData = ({current,pageSize,tagId}) => {
    return http.get(`/videoErase/getEraseList`,{ params:{page:current,size:pageSize,tag_id:tagId}}).then(res => (
        {
            total: res.data.count,
            list: res?.data?.data
        }
    ));
};
const getTableDataSel = (): Promise<any> => {
 
    return http.get(`/videoErase/getEraseTagList`)
      .then((res) =>  res.data.data );
};
const VideoClear: React.FC<Props> = (props) => {
   
    const { data:dataArray, refresh:refreshSel} = useRequest(getTableDataSel)
    const [classStatus, setClassStatus] = useState(false)
    const [tagId, setTagId] = useState<any>()
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const { tableProps, refresh } = useAntdTable((parms)=>getTableData({...parms, tagId}), {
        refreshDeps:[tagId]
    })

    const columns: ProColumns[] = [
        {
            title: '视频名字',
            dataIndex: 'name',
            key: 'name',
            width:200
        },
        {
            title: '擦除任务ID',
            dataIndex: 'erase_job_id',
            key: 'erase_job_id',
            width:120
        },
        {
            title: '标签',
            dataIndex: 'tag',
            key: 'tag',
            width:120
        },
        {
            title: '本地URL',
            dataIndex: 'source_url',
            key: 'source_url',
            valueType:"text",
            ellipsis:true,
            width: 140,
            
        },
        {
            title: '字幕状态',
            dataIndex: 'extractionStatus',
            key: 'extractionStatus',
            width:120,
            valueEnum: {
                0: { text: '未提取' },
                1: { text: '提取中' },
                2: { text: '提取完成' }
            },
        },
        {
            title: '擦除状态',
            dataIndex: 'status',
            key: 'status',
            width:120,
            valueEnum: {
                1: { text: '未擦除' },
                2: { text: '擦除中' },
                4: { text: '擦除完成' }
            },
        },
        {
            title: '擦除后URL',
            dataIndex: 'erase_url',
            key: 'erase_url',
            ellipsis:true,
            copyable: true,
            width:140
        },
        {
            title: '擦除区域',
            dataIndex: 'erase_area',
            key: 'erase_area',
            width:140
           
        },
        {
            title: '上传时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width:140
        },
        {
            title: '开始擦除时间',
            dataIndex: 'erase_time',
            key: 'erase_time',
            valueType: 'dateTime',
            width:140
        },

    ];

    const onSelectChange = (newSelectedRowKeys: React.Key[], selectedRows,info) => {
        setSelectedRowKeys(selectedRows);
    };
  
    const rowSelection: TableRowSelection<any> = {
      selectedRowKeys:selectedRowKeys.map((item:any) => item.videoId ),
      getCheckboxProps: (record: any) => ({
        // disabled: record.status !== 4, // Column configuration not to be checked
        // name: record.name,
      }),
      onChange: onSelectChange,
      selections: [
        Table.SELECTION_ALL,
        Table.SELECTION_INVERT,
        Table.SELECTION_NONE,
      ],
    };
    
    const downloadQueue = async (isFont) => {
        console.log(selectedRowKeys,'selectedRowKeys==')
        for (const item of selectedRowKeys as any) {
            const localDomain = window.location.origin;
            const href = isFont ? `${localDomain}${baseUrl}${item.extractionUrl}` : item.erase_url;
        
            if (!isFont && !item.erase_url) {
                console.error('not erase_url')
                continue;
            }
             
            if (isFont && !item.extractionUrl) {
                console.error('not extractionUrl')
                continue;
            }
            setLoading(true)
            const response = await fetch(href);
            setLoading(false)
            if (!response.ok) {
                console.error('Failed to fetch data:', response.statusText);
                continue;
            }
    
            const data = await response.blob();
    
            const newFileName = `${item.name}-字幕提取.srt`;
    
            const link = document.createElement('a');
            link.href = URL.createObjectURL(data);
            link.download = isFont ? newFileName : item.name;
            link.rel = 'noopener noreferrer';
    
            link.click();
    
            URL.revokeObjectURL(link.href);
    
            await new Promise(resolve => setTimeout(resolve, 500)); // 1秒延迟
        }
    };
    
    const downloadFn = (v) => {
      
        downloadQueue(v)
    }

    const clearFont = () => {
        http.get('/videoErase/doErase',{params:{videoIds:selectedRowKeys.map((item:any) => item.videoId ).join()}}).then(res => {
            if(res.data.code === 0){
                message.success('操作成功！')
                refresh()
            }
        })
    }

    const getFont = () => {
        http.get('/videoErase/doExtrac',{params:{videoIds:selectedRowKeys.map((item:any) => item.videoId ).join()}}).then(res => {
            if(res.data.code === 0){
                message.success('操作成功！')
                refresh()
            }
        })
    }

    return (
        <Fragment>
            <Card>
                <UploadVideo setTagId={setTagId} tagId={tagId} dataArray={dataArray} setClassStatus={setClassStatus} refresh ={ refresh} />
            </Card>
            <Drawer title="分类管理" width={"80%"} onClose={() => {
                setClassStatus(false)
                refreshSel()
            }} open={classStatus}>
                <ClassCom />
            </Drawer>
            <div style={{height:15}}></div>
            <Card title={
                <Space>
                    <Button loading={loading} onClick={() => downloadFn(false) } type="primary">批量下载视频</Button>
                    <Button loading={loading}  onClick={() => downloadFn(true) } type="primary">批量下载字幕</Button>
                    <Button loading={loading}  onClick={() => clearFont() } type="primary">擦除字幕</Button>
                    <Button loading={loading}  onClick={() => getFont() } type="primary">提取字幕</Button>
                </Space>
                
            }>
                <ProTable
                    rowSelection={rowSelection} 
                    bordered
                    scroll={{ x: 1300 }}
                    columns={columns}
                    search={false}
                    toolBarRender={false}
                    rowKey={'videoId'}
                      
                    {...tableProps}
                    pagination={{...tableProps.pagination,showSizeChanger:true}}
                />
            </Card>
        </Fragment>
   
    )
}

export default VideoClear;