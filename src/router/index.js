import { createRouter, createWebHistory } from 'vue-router'

const routes = [
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
		component: () => import('@/views/FileManager/FileManager.vue')
	},
	{
		path: '/:pathMatch(.*)*',
		redirect: { name: 'FileManager' },
		name: 'NotFound'
	}
]

const router = createRouter({
	history: createWebHistory(),
	routes
})

export default router
