import axios from 'axios'

export const instance = axios.create({
	// withCredentials: true,
	baseURL: 'http://localhost:3000/'
	// headers: {
	// 	Authorization: localStorage.getItem('cloudToken')
	// 		? `Bearer ${localStorage.getItem('cloudToken')}`
	// 		: ''
	// }
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
