import { instance } from './api'
import { UserStorage } from '@/services/userStorage'

export const Auth = {
	async login({ email, password }) {
		try {
			const res = await instance.post('api/auth/login', {
				email,
				password
			})
			return res
		} catch (error) {
			console.error(error)
			return error
		}
	},
	async registration({ email, password }) {
		try {
			const res = await instance.post('api/auth/registration', {
				email,
				password
			})
			return res
		} catch (error) {
			console.error(error)
			return error
		}
	},
	async auth() {
		try {
			const res = await instance.get('api/auth/auth')
			return res
		} catch (error) {
			console.error(error)
			UserStorage.removeItem('cloudToken')
			return error
		}
	}
}
