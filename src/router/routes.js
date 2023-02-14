import isAuth from './middlewares/isAuth'

export const routes = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/views/Auth/Auth.vue')
	},
	{
		path: '/registration',
		name: 'Registration',
		component: () => import('@/views/Auth/Auth.vue')
	},
	{
		path: '/files',
		name: 'FileManager',
		component: () => import('@/views/FileManager/FileManager.vue'),
		meta: {
			middleware: [isAuth]
		}
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: { name: 'FileManager' },
		name: 'NotFound',
		meta: {
			middleware: [isAuth]
		}
	}
]
