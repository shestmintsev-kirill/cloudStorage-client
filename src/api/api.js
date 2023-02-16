import axios from 'axios'
import { UserStorage } from '@/services/userStorage'
import { useAppStore } from '@/store/app'

export const instance = axios.create({
	baseURL: 'http://localhost:3000/'
})

instance.interceptors.request.use(
	request => {
		let token = UserStorage.getItem('cloudToken') || ''
		if (token) request.headers.Authorization = `Bearer ${token}`
		return request
	},
	error => {
		return Promise.reject(error)
	}
)

instance.interceptors.response.use(
	response => response,
	error => {
		if ([401, 403].includes(error?.response?.status)) {
			const appStore = useAppStore()
			appStore.LOGOUT()
		}
		return Promise.reject(error)
	}
)
