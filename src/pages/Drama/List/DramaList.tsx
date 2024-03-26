import React, { Fragment, useEffect, useState } from 'react';
import { UserOutlined, PlusOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Popconfirm, message, Divider, List, Skeleton, Card, Row, Col, Button, Space, Tag, Form, Input, Select, Switch, Modal } from 'antd';
import { http } from 'src/service'
import dayjs from 'dayjs'
import { useAsyncEffect, useRequest } from 'ahooks'
import { useImmer } from 'use-immer'
import { isEmpty } from 'lodash'
import DramaForm from './add'
import VideoList from './videoList'

const { Option } = Select;


interface DataType {
	id: string;
	name: string;
	desc: string;
	cover_real_url: string;
	all_count: string;
	create_time: string
}

const App: React.FC = () => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<DataType[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [options, setOptions] = useState<any>([]);
	const [search, setSearch] = useImmer<any>({})
	const [visible, setVisible] = useState(false);
	const [visibleVideo, setVisibleVideo] = useState(false);
	const [dramaId, setDramaId] = useState('')
    const [record, setRecord] = useState<any>({})
    const {loading:cacheLoading , run } = useRequest(() => http.post('/series/refreshCache'),{
        manual: true,
        onSuccess(res) {
            if(res.data.code === 0){
                message.success('操作成功!')
            }
           
        },
        onError(error: Error){
            console.log(error)
        }
    })
	const pageSize = 10;

	const loadMoreData = async () => {

		if (loading) {
			return;
		}
		setLoading(true);
		try {
			const response = await http.get('/series/getList', { params: { name: search.name, tags: search.tags, page: currentPage, size: pageSize } });
			if (response.data.code === 0) {
				if (!isEmpty(search.name) || !isEmpty(search.tags)) {
					setData(prevData => [...response.data.data]);
					setCurrentPage(1)
					setTotalPages(1)
				} else {
					setData(prevData => [...prevData, ...response.data.data]);
					setTotalPages(Math.ceil(response.data.count / pageSize));
				}


			} else {
				throw new Error('请求发生错误');
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadMoreData();
	}, [currentPage, search]);
	useAsyncEffect(async () => {
		const res = await http.get('/tags/tagList?page=1&size=1000')
		if (res.data.code === 0) {
			setOptions(res.data.data)
		}
	}, [])
    useEffect(()=>{
        if(!isEmpty(record)){
            setVisibleVideo(true)
        }else {
            setVisibleVideo(false)
        }
    },[record])

	const handleLoadMore = () => {
		if (currentPage < totalPages) {
			setCurrentPage(c => c + 1);
		}
	}

	// 提交表单的处理函数
	const handleSubmit = (values) => {
		setSearch({ ...values, tags: values?.tags?.join() })
	};
    
	const resetList = () => {
		setData([]);
		setCurrentPage(1)			
		setTotalPages(1)
		setVisible(false)
		setTimeout(()=>{
			loadMoreData();
		},0)
		
	}

	const editFn = (id) => {
		setDramaId(id)
		setVisible(true)
	}

	const deleteFn = (id) => {
		http.get('/series/delDrama',{ params:{ dramaId: id }}).then(res => {
			if(res.data.code === 0) {
				message.success('操作成功')
				resetList()
			}
		})
	}

    const handleChange = (dramaId, hide) => {

        Modal.confirm({
            title: '确认切换吗？',
            content: '切换后将影响该项的显示状态',
            onOk() {
                http.post('/series/editDramaHide',{ dramaId, hide: hide ? 0 : 1 }).then(res => {
                    if(res.data.code === 0 ){
                        message.success('操作成功')
                        resetList()
                    } 
                }).catch(error => {
        
                })
            }
        
        });
    }

    const onPublish = () => {
        run()
    }

	return (
		<Fragment>
			{
				visibleVideo &&
				<VideoList
                    record ={ record }
					resetList={resetList}
					visible={visibleVideo}
					onCancel={() => setRecord({})}
				/>
			}
			{
				visible &&  
				<DramaForm
					dramaId={dramaId}
					resetList={resetList}
					visible={visible}
					onCancel={() => setVisible(false)}

				/>
			}
		
			<Card
            extra={
                <Button loading={cacheLoading} disabled={cacheLoading} onClick={() => onPublish()} type="primary">发布</Button>
            }
			title={
				<Button  icon={<PlusOutlined />}  onClick={() => {  setDramaId(''); setVisible(true);}} style={{ display: "inline-block", margin: "15px 0" }} type="primary" >新增</Button>
			} style={{ marginBottom: 10 }}>
				<Form layout="horizontal" onFinish={handleSubmit}>
					<Row gutter={16}>
						<Col span={6}>
							<Form.Item
								name="name"
							>
								<Input size="middle" prefix={<UserOutlined />} placeholder="请输入剧集名称" />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name="tags">
								<Select
									size="middle"

									mode="multiple"
									style={{ width: '100%' }}
									placeholder="请选择标签"
									allowClear
								>
									{options?.map((option) => <Option key={option.tag_id}>{option.tag_name}</Option>)}
								</Select>
							</Form.Item>
						</Col>
						<Col span={2} style={{ width: 85 }}>
							<Form.Item>
								<Button size="middle" type="primary" htmlType="submit">
									搜索
								</Button>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card>

			<Card>
				<InfiniteScroll
					dataLength={data.length}
					next={handleLoadMore}
					hasMore={currentPage < totalPages}
					loader={<Skeleton avatar paragraph={{ rows: 5 }} active />}
					endMessage={<Divider plain>我是底线 🤐</Divider>}

					scrollThreshold={1}  // Add this line
				>
					<List
						grid={{
							gutter: 16,
							xs: 1,
							sm: 2,
							md: 3,
							lg: 3,
							xl: 3,
							xxl: 3,
						}}
						dataSource={data}
						renderItem={(item: any) => (
							<List.Item className='video-list' >
								<Card onClick={() => {
									setRecord(item)
									
								} }>
									
									<Row gutter={16} >
										<Col span={8}>
											<img className='list-img' src={item.cover_real_url} />
										</Col>
										<Col span={16}>
											<div className='list-content'>
												<h2 title={item.name}>{item.name}</h2>
												<p>总集数: {item.all_count}</p>
												<p>创建时间: {dayjs(item.create_time).format('YYYY-MM-DD')}</p>
												<p style={{ height: 50 }}>
													{item?.tags && item?.tags.map(item => (
														<Tag key={item.tag_id} color={item.tag_color}>{item.tag_name}</Tag>
													))}

												</p>
												<p>
													<Space>
														<Button onClick={(event) =>{ event.stopPropagation(); editFn(item.id);}} size="small" type="primary">编辑</Button>
														<Popconfirm
															title="确认删除"
															description="确认删除剧集么？"
															onConfirm={() => deleteFn(item.id)}
															okText="Yes"
															cancelText="No"
														>
															<Button  onClick={(event) =>{ event.stopPropagation() }}size="small" type="primary" danger>删除</Button>
														</Popconfirm>
                                                        
                                                        <span onClick={ (event) => event.stopPropagation()}> <Switch value={ !item.hide } onChange={() => handleChange(item.id, item.hide)} /></span>
                                                       
														
													</Space>
												</p>
											</div>
										</Col>
									</Row>
									<div className='list-desc' >
										<h2>简介</h2>
										<p>
											{item.desc}
										</p>
									</div>
								</Card>
							</List.Item>
						)}
					/>
				</InfiniteScroll>
			</Card>
		</Fragment>

	);
};

export default App;