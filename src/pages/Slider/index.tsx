import { useEffect, useState } from 'react';
import { UserOutlined, LaptopOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom'
import { useRequest, useAsyncEffect } from 'ahooks'

import { http } from 'src/service'
import { isEmpty } from 'lodash';
const { SubMenu } = Menu;

function api () {
    return http.get('/menulist')
}

const ServerMenu = ({}) => {
    const [menuData, setMenuData] = useState<any>([])
    const Navigate = useNavigate()
    useRequest(() => api(), {
        onSuccess(res) {
            if(res.data.code === 0){
                setMenuData(res.data.data)
            }
           
        },
        onError(error: Error){
            console.log(error, 'error')
        }
    })

  return (
    <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        >
        {  menuData.map((item, i) => (
            <SubMenu 
            key={`sub${i+1}`}
            icon={item.iconCls === 'layui-icon-print' ? <UserOutlined /> : <LaptopOutlined />}
            title={item.text}
            >
            {  !isEmpty(item.leafList) && item.leafList.filter(item => !['sys/showApplist'].includes(item['menuPath'])).map((leaf, j) => (
                <Menu.Item
                key={`${i}-${j}`}
                onClick={() => Navigate(leaf.menuPath)}
                >
                {leaf.text}
                </Menu.Item>
            ))}
            </SubMenu>
        ))}
    </Menu>
  )
}

export default ServerMenu;