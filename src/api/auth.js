import { instance } from './api'

export const Auth = {
	async login({ email, password }) {
		try {
			const res = await instance.post('api/auth/login', {
				email,
				password
			})
			return res
		} catch (error) {
			console.log(error.response.data.message)
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
			console.log(error.response.data.message)
		}
	},
	async auth() {
		try {
			const res = await instance.get('api/auth/auth', {
				headers: {
					Authorization: `Bearer ${localStorage?.cloudToken}`
				}
			})
			return res
		} catch (error) {
			console.log(error.response.data.message)
			localStorage.removeItem('cloudToken')
		}
	}
}
