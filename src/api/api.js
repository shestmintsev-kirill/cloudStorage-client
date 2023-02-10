import axios from 'axios'

export const instance = axios.create({
	baseURL: 'http://localhost:3000/'
})

instance.interceptors.request.use(
	request => {
		// Do something before request is sent
		let token = localStorage.getItem('cloudToken') || ''
		if (token) request.headers.Authorization = `Bearer ${token}`
		return request
	},
	error => {
		// Do something with request error
		return Promise.reject(error)
	}
)
