import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Upload, Button, message, Select, Space } from "antd";
import { InboxOutlined } from '@ant-design/icons';
import { http } from 'src/service'
import type { UploadProps } from 'antd';
import { isEmpty } from "lodash";
import { useRequest } from 'ahooks'

interface Props {
    refresh: () => void
}

function getEraseAreas() {
    return http.get('/videoErase/getEraseAreas').then(res => res.data.data)
}
const MyUploadComponent: React.FC<Props> = ({ refresh }) => {

    const [fileList, setFileList] = useState<any>([]);
    const AliyunUpload = useRef<any>(null)
    const [area, setArea] = useState(1)
    const { data } = useRequest(getEraseAreas)
    useEffect(() => {
        const payload = {
            userId: "1021906854894423",
            onUploadstarted(uploadInfo) {
                console.log(uploadInfo)
                const fileName = uploadInfo.file.name
                http.post('/series/createUploadVideoNotSpeedUp', { title: fileName, fileName: fileName }).then(res => {
                    if (res.data.code === 0) {
                        AliyunUpload.current.setUploadAuthAndAddress(uploadInfo, res.data.uploadAuth, res.data.uploadAddress, res.data.videoId);
                        setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === uploadInfo.file.uid ? { ...prevFile, status: 'uploading' } : prevFile));
                    }
                }).catch(error => {
                    message.error('获取凭证失败！')
                })
            },
            onUploadSucceed(uploadInfo) {

                setFileList(prevFileList => {
                    const updatedFileList = prevFileList.map(prevFile => prevFile.uid === uploadInfo.file.uid ? { ...prevFile, status: 'done' } : prevFile);
                    return updatedFileList
                });
                console.log(uploadInfo.videoId, 'uploadInfo.videoId')
                voideoUploadSuccess(uploadInfo.videoId, uploadInfo.file.name)

            },
            onUploadFailed(uploadInfo, code, mess) {
                message.error(mess);
                setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === uploadInfo.file.uid ? { ...prevFile, status: 'error' } : prevFile));

            },
            onUploadProgress(uploadInfo, totalSize, loadPercent) {
                var percent = Math.floor(loadPercent * 100);
                setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === uploadInfo.file.uid ? { ...prevFile, percent: percent } : prevFile));
            },
            onUploadEnd: function (uploadInfo) {
                setFileList([])
                message.success('上传完成')
                setTimeout(() => {
                    refresh()
                }, 1000);
            }
        }
        AliyunUpload.current = null
        if (AliyunUpload.current) return
        AliyunUpload.current = new (window as any).AliyunUpload.Vod(payload)
    }, [area])


    const voideoUploadSuccess = (id, name) => {
        console.log(area, 'area')
        http.post('/videoErase/erase',{id,name, areaId:area}).then(res => {
            if (res.data.code === 0) {
            }
        }).catch(error => {
            message.error('上报失败')
        })
    }


    const handleBeforeUpload = (file: any, fileList: File[]): boolean => {
        const isVideo = file.type.startsWith('video/');
        if (!isVideo) {
            message.error('您只能上传视频文件!');
            return false
        }
        setFileList(prevFileList => [...prevFileList, { uid: file.uid, file, name: file.name, percent: 0 }]);
        return false
    }

    const onChangeList: any = (info) => {
        if (info.file.status === "removed") {
            const cList = info.fileList.map(item => item.uid)
            const l = fileList.filter(item => cList.includes(item.uid))
            setFileList(l)
        }
    }

    const props: UploadProps = {
        accept: 'video/*',
        fileList,
        name: 'file',
        multiple: true,
        action: '/upload/demo',
        beforeUpload: handleBeforeUpload,
        onChange: onChangeList
    }
    const startUp = (e) => {

        if (isEmpty(fileList)) return message.error('请上传文件~')
        e.stopPropagation()
        fileList.map(item => {
            AliyunUpload.current.addFile(item.file, null, null, null, '{"Vod":{}}');
        })
        AliyunUpload.current.startUpload()
    }

    return (
        <Fragment>
            <Space>
            {fileList.length !== 0 && <Button danger onClick={(e) => startUp(e)} type="primary">点击开始上传</Button>}
            <Select style={{width:120}} value={area} onChange={(value) => setArea(value)}>
                {data?.map(item => {
                    return (
                        <Select.Option value={item.id} >
                        {item.name}
                        </Select.Option>
                    )
                })}
            </Select>
            </Space>
            <div style={{ height:15}}></div>
            <Upload.Dragger  {...props}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或将文件拖拽到此处</p>

            </Upload.Dragger>

        </Fragment>

    )
}

export default MyUploadComponent;