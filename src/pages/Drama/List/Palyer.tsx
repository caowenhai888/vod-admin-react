import React from 'react'
import { Modal } from 'antd'
interface Props {
    isModalOpen: boolean,
    setModalOpen: (v:boolean) => void
}
const Player:React.FC<Props>= ({isModalOpen, setModalOpen}) => {
    return (
        <Modal footer={null} width={'80%'} open={isModalOpen} onCancel={() => setModalOpen(false)} >
                <div style={{ height:"80vh" }} id="J_prismPlayer"></div>
        </Modal>
    )
}

export default Player