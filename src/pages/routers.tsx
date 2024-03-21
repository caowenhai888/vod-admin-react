import { lazy, Suspense } from 'react'
import { Result, Button } from 'antd'
import { createBrowserRouter, Navigate, redirect } from 'react-router-dom'

import type { RouteObject } from 'react-router-dom'
import { ErrorBoundary } from 'src/components'
import Layout from 'src/pages/Layout'
import Top from 'src/pages/Drama/Top/'
import NoPermissionPage from 'src/pages/403'
import Video from 'src/pages/Drama/List/DramaList'
import Tag from 'src/pages/Drama/Tag'
import Login from 'src/pages/Login'
// import Home from 'src/pages/Home'

const routerConfig:RouteObject[] = [
     {
        path: '/',
        id: 'root',
        errorElement: <ErrorBoundary />,
        element: <Layout />,
        children: [
            {
                path: '/',
                index: true,
                element: <Navigate to='/series/showList' />
            },
            {
                path: '/home',
                element: <div>home</div>,
            },
            {
                path: '/series/showList',
                element: <Video />,
            },
            {
                path: '/tags/list',
                element: <Tag />,
            },
            {
                path: '/top/list',
                element: <Top />,
            }
            
        ]
    },
    {
        path: '/login',
        element: <Login  />
    },
    {
        path: '*',
        element:  <NoPermissionPage />,
    }

]

export const routes = createBrowserRouter(routerConfig)
