import React, { Fragment, useEffect, useState } from 'react';
import { Modal } from 'antd'
import { useAsyncEffect } from 'ahooks'
import { http } from 'src/service'

interface Props {
    open: boolean
    setModalOpen: (v:boolean) => void,
    record?: any 
}
const Player:React.FC<any> = (props) => { 
    const { open, setModalOpen,record } = props
   
    useAsyncEffect( async ()=> {
        if(!record.video_id) return 
        setModalOpen(true)
        console.log(record, 'record===')
        http.post('/series/getVideoPlayAuth',{videoId:record.video_id}).then(res => {
            if(res.data.code === 0) {
                setModalOpen(true)
                new (window as any).Aliplayer({
                    id: 'J_prismPlayer',
                    width: '100%',
                    height: '100%',
                    vid : record.video_id,
                    playauth : res.data.playAuth, // 使用获取到的播放凭证
                },function(player){
                    console.log('The player is created.')
                });
            }
        })
      
    }, [record])
    return (
        <div>
            <Modal destroyOnClose footer={null} width={'80%'} open={open} onCancel={() => setModalOpen(false)} >
                <div style={{ height:"80vh" }} id="J_prismPlayer"></div>
            </Modal>
        </div>
    )
}

export default Player