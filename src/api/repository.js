import { instance } from './api'

export const Repository = {
	async getRepository() {
		try {
			const res = await instance.get('api/repository')
			return res
		} catch (error) {
			console.log(error)
			return error
		}
	},
	async updateRepository(repository) {
		try {
			const res = await instance.put('api/repository/update', repository)
			return res
		} catch (error) {
			console.log(error)
			return error
		}
	}
}
