import React, { Fragment, useEffect, useState } from 'react';
import { Card, Table } from 'antd'
import { ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useAntdTable } from 'ahooks' 
import { http } from 'src/service'
import UploadVideo from './UploadVideo'

interface Props { }

const getTableData = ({current,pageSize}) => {
    return http.get(`/videoErase/getEraseList`,{ params:{page:current,size:pageSize}}).then(res => (
        {
            total: res.data.count,
            list: res?.data?.data
        }
    ));
};
const VideoClear: React.FC<Props> = (props) => {
    const { tableProps, refresh } = useAntdTable(getTableData)
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
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width:120,
            valueEnum: {
                0: { text: '全部' },
                1: { text: '未擦除' },
                2: { text: '擦除中' },
                3: { text: '已擦除' },
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
    return (
        <Fragment>
            <Card>
                <UploadVideo refresh ={ refresh} />
            </Card>
            <div style={{height:15}}></div>
            <Card>
                <ProTable
                    bordered
                    scroll={{ x: 1300 }}
                    columns={columns}
                    search={false}
                    toolBarRender={false}
                    {...tableProps}
                />
            </Card>
        </Fragment>
   
    )
}

export default VideoClear;