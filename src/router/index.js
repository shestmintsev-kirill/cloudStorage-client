import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import middlewareFactory from './middlewareFactory'

const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach((to, from, next) => {
	if (Array.isArray(to.meta.middleware) && to.meta.middleware.length) {
		const middleware = to.meta.middleware // Array of all middlewares to check
		const context = { to, from, next }
		return middleware[0]({
			...context,
			next: middlewareFactory(context, middleware, 1, next),
			redirect: next
		})
	}
	return next()
})

export default router
