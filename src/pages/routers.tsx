import { lazy, Suspense } from 'react'
import { Result, Button } from 'antd'
import { createBrowserRouter, Navigate, redirect } from 'react-router-dom'

import type { RouteObject } from 'react-router-dom'
import { ErrorBoundary } from 'src/components'
import Layout from 'src/pages/Layout'

const Home = lazy(() => import('src/pages/Home'))
const Login = lazy(() => import('src/pages/Login'))
const Tag = lazy(() => import('src/pages/Drama/Tag'))
const  Video = lazy(() => import('src/pages/Drama/List/DramaList'))
const NoPermissionPage = lazy(() => import('src/pages/403'))
const Top = lazy(() => import('src/pages/Drama/Top/'))
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
                element: <Navigate to='/home' />
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
