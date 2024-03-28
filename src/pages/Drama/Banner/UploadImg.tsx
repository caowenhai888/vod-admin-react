import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from '@ant-design/icons';
import { http } from 'src/service'
import type { UploadProps } from 'antd';

interface MyUploadComponentProps {
  value?: any, 
  onChange?: (value: any) => void;
}

const MyUploadComponent = forwardRef((props: MyUploadComponentProps, ref) => {
  const { value, onChange } = props;
  const [fileList, setFileList] = useState<any>([]);
 
  let timer: any = null

  const upFn = (fileName, file, key) => {
    var userData = '{"Vod":{}}'
    var uploader = new (window as any).AliyunUpload.Vod({
        userId: "1021906854894423",
        onUploadstarted(uploadInfo) {
            http.post('/series/createUploadImage', { title: fileName, fileName: fileName }).then(res => {
                if (res.data.code === 0) {
                    const credentials = res.data.videoId;
                    uploader.setUploadAuthAndAddress(uploadInfo, res.data.uploadAuth, res.data.uploadAddress, res.data.imageId);
                    setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === file.uid ? { ...prevFile, status: 'uploading' } : prevFile));
                }
            })
        },
        onUploadSucceed(uploadInfo) {
            setFileList(prevFileList => {
                const updatedFileList = prevFileList.map(prevFile => prevFile.uid === file.uid ? { ...prevFile, status: 'done' } : prevFile);
                const areAllFilesUploaded = updatedFileList.every(file => file.status === 'done');
                if (areAllFilesUploaded) {
                    if (timer) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(() => {
                        message.success('上传完成')
                        setFileList([])
                    }, 500);
                }
                return updatedFileList;
            });
            if (onChange) {
                onChange(uploadInfo.videoId);
            }
        },
        onUploadFailed(uploadInfo, code, mess) {
            message.error(mess);
            setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === file.uid ? { ...prevFile, status: 'error' } : prevFile));
        },
        onUploadProgress(uploadInfo) {
            const progress = Math.round(uploadInfo.size * 100 / file.size);
            setFileList(prevFileList => prevFileList.map(prevFile => prevFile.uid === file.uid ? { ...prevFile, percent: progress } : prevFile));
        }
    })
    uploader.addFile(file, null, null, null, userData);
    uploader.startUpload();
  }

  const handleBeforeUpload = (file: any, fileList: File[]): boolean => {
    setFileList(prevFileList => [...prevFileList, { uid: file.uid, name: file.name, status: 'uploading', percent: 0 }]);
    let newKey = new Date().getTime();
    upFn(file.name, file, newKey);
    return false
  }

  const uploadProps: UploadProps = {
    listType:"picture",
    fileList,
    name: 'file',
    multiple: true,
    action: '/upload/demo',
    beforeUpload: handleBeforeUpload
  }

  useImperativeHandle(ref, () => ({
    triggerChange: (uploadInfo) => {
      if (onChange) {
        onChange(uploadInfo.videoId);
      }
    }
  }));

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />}>点击上传</Button>
    </Upload>
  )
})

export default MyUploadComponent;