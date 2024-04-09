import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Row,Col, message, Select } from 'antd';
import { http } from 'src/service'
import { isEmpty } from 'lodash';
import UploadImg from './UploadImg'
const { TextArea } = Input;
const { Option } = Select;

interface Props{
    visible:boolean
    dramaId?: string
    onCancel?: () => void
    resetList:() => void
}
const DramaForm:React.FC<Props> = ({ visible, onCancel, dramaId, resetList }) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [ record, setRecord] = useState<any>({})

  // 加载并设置标签
  useEffect(() => {
    http.get('/tags/tagList')
      .then(res => {
        if(res.data.code === 0) {
          const tagsList = res.data.data.map(tag => ({ value: tag.tag_id, label: tag.tag_name }));
          setTags(tagsList);
        }
      })
      .catch(() => message.error('加载失败'));
  }, []);

  // 加载剧集详情
  useEffect(() => {
    if(dramaId) {
        http.get('/series/getDetail', { params: { id: dramaId } })
        .then(res => {
          if(res.data.code === 0) {
            const drama = res.data.data;
            setRecord(drama)
            const { tags } = drama
            form.setFieldsValue({...drama, tags: isEmpty(tags) ? []:tags.map(item=> item.tag_id)});
          }
        })
        .catch((error) => message.error(error.message));
    }
  }, [dramaId, form]);

  // 提交表单
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {

        if(dramaId) {
            http.post('/series/editDrama',{...values, tags:values?.tags?.join(),dramaId }).then(res => {
                if(res.data.code === 0) {
                    message.success('操作成功')
                    resetList()
                }
            })
        } else {
            // 提交数据
            http.post('/series/createDrama',{...values, tags:values?.tags?.join() }).then(res => {
                
                if(res.data.code === 0) {
                    message.success('操作成功')
                    resetList()
                }
            })
        }
      })
      .catch(info => {
        console.log('验证失败:', info);
      });
  };

  // 清空数据
  const handleCancel = () => {
    form.resetFields();
    onCancel && onCancel();
  };

  return (
    <Modal open={visible} title="添加剧集" onCancel={handleCancel} onOk={handleSubmit}>
      <Form  
        style={{ padding:"20px 10px"}}
        labelCol={{ span: 6 }}
        form={form} 
        layout="horizontal" 
        name="form_in_modal">
        <Form.Item name="name" label="剧集名称" rules={[{ required: true, message: '请输入名称!' }]}>
          <Input />
        </Form.Item>
     
        <Form.Item label="封面地址" shouldUpdate={(prevValues, curValues) => prevValues.cover_url !== curValues.cover_url}>
            <Row gutter={5}>
                <Col span={12}>
                    <Form.Item name="cover_url" shouldUpdate  >
                        <Input />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item>
                        <UploadImg form={form} />
                    </Form.Item>
                </Col>
            </Row>
        </Form.Item>

        <Form.Item name="all_count" label="总剧集数" rules={[{ required: true, message: '请输入总剧集数!' }]}>
          <InputNumber width={"100%"} />
        </Form.Item>
        <Form.Item name="tags" label="标签">
          <Select
            mode="multiple"
            placeholder="请选择标签"
            options={tags}
          />
        </Form.Item>

        <Form.Item name="play_count" label="播放量">
          <InputNumber width={"100%"} />
        </Form.Item>

        <Form.Item name="common_order" label="All Serials排序">
          <InputNumber width={"100%"} />
        </Form.Item>
        <Form.Item name="discover_order" label="Discover排序">
          <InputNumber width={"100%"} />
        </Form.Item>     

        <Form.Item name="collect_count" label="收藏数">
          <InputNumber width={"100%"} />
        </Form.Item>

        <Form.Item name="desc" label="剧集描叙" rules={[{ required: true, message: '请输入剧集描述!' }]}>
          <TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DramaForm;