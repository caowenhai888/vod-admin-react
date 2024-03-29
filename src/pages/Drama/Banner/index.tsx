import { Fragment, useRef } from 'react'
import { Select,Row,Image, message, Button, Space } from 'antd';
import UploadImg from './UploadImg'
import { useRequest } from 'ahooks'
import { http, fetch } from 'src/service'
import { 
    ProCard,
    ProForm,
    ProFormGroup,
    ProFormList,
    ProFormItem,
    
 } from '@ant-design/pro-components';
import { DownOutlined, UpOutlined} from '@ant-design/icons'
import type { ProFormInstance, FormListActionType } from '@ant-design/pro-components'
import { useEffect } from 'react';
import { isEmpty } from 'lodash';


const { Option } = Select

const  api =  () => {
    return http.get('/rank/getRankDrama').then((res) => res.data.data.map(item => ({value:item.dramaId, label:item.dramaName})))
}
const fetcList = () => {
    return http.get('/banner/getBannerList').then((res) => res.data.data)
}
const TagsTable = () => {
    const { data }  = useRequest(api)
    const { data:list, refresh, loading }  = useRequest(fetcList)
    const formRef = useRef<ProFormInstance>();
    const onFinish = async (values) => {
        fetch.post('/banner/editBanner', values).then(res =>{
            if(res.data.code === 0){
                refresh()
                message.success('操作成功!')
            }
        })
      
    }
    useEffect(() => {
        if(isEmpty(list))return
        formRef.current?.setFieldValue('data',list)
     
    },[list])

    const actionRef = useRef< FormListActionType<any>>();
    return (
        <ProCard title="Banner管理" loading={loading}>
            <ProForm  submitter={{ resetButtonProps:false}}  formRef={formRef} onFinish={ onFinish } layout="horizontal">
                <ProFormList 
                    name="data"
                    actionRef={actionRef}
                    itemRender={({ listDom, action }, { record, index }) => {
                        const lastIndex = (actionRef.current?.getList()?.length as any) -1
                        return (
                        <ProCard
                            bordered
                            extra={
                                <Fragment>
                                    <Space>
                                        {
                                            index !== 0 &&
                                            <UpOutlined onClick={() => {
                                                actionRef.current?.move(index, index-1);
                                            }} />
                                        }
                                        {
                                            index !== lastIndex &&  <DownOutlined onClick={() => {
                                                actionRef.current?.move(index, index+1);
                                            }} />
                                        }
                                        {action}
                                    </Space>
                                </Fragment>
                            }
                            style={{
                                marginBlockEnd: 8,
                            }}
                        >
                            {listDom}
                        </ProCard>
                        );
                    }}
                    >
                        {(f, index, action) => {
                            return (
                                <ProFormGroup key="group">
                                    <ProFormItem name="dramaId" >
                                        <Select 
                                            optionFilterProp="children"
                                            allowClear
                                            showSearch
                                            style={{width:200,}} 
                                            placeholder="选择剧集" >
                                            {data.map(item =>{
                                                return  <Option 
                                                disabled={actionRef.current?.getList()?.map(item=>(item.dramaId)).includes(item.value)}
                                                key={item.value} 
                                                value={item.value}>{item.label}</Option>
                                            })}
                                        </Select>
                                    </ProFormItem>
                                    <ProFormItem name="bannerImage" rules={[{required:true,message:"请上传banner"}]}>
                                        <UploadImg   />
                                    </ProFormItem>
                                    <ProFormItem hidden={!action.getCurrentRowData()['bannerImageUrl']} >
                                        <Image
                                            style={{ objectFit:"cover"}}
                                            width={200}
                                            height={100}
                                            src={action.getCurrentRowData()['bannerImageUrl']}
                                        />
                                    </ProFormItem>
                                </ProFormGroup>
                            )
                        }}
                </ProFormList>
            </ProForm>
        </ProCard>
    );
};

export default TagsTable;