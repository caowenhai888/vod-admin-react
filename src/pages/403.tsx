import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import React from 'react';

const NoPermissionPage = () => {
  const history = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle="Sorry, you are not authorized to access this page."
      extra= {<Button type="primary" onClick={() => history(-1)} >
      返回上一页
    </Button> } />
  )

}
export default NoPermissionPage