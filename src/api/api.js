import axios from 'axios'

export const instance = axios.create({
	baseURL: 'http://localhost:3000/'
})

instance.interceptors.request.use(
	request => {
		let token = localStorage.getItem('cloudToken') || ''
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
			alert('Login error, please login again')
			window.location.href = '/login'
		}
		return Promise.reject(error)
	}
)
