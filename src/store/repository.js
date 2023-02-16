import { defineStore } from 'pinia'
import $snackBar from '@/services/snackBar'
import { Repository } from '@/api/repository'
import helpers from '@/helpers'
import { useStorageStore } from './storage'

export const useRepositoryStore = defineStore('repository', {
	state: () => ({
		repository: {},
		repoLoading: false
	}),
	getters: {},
	actions: {
		async RESET_REPO() {
			try {
				await this.UPDATE_REPO({})
				const storageStore = useStorageStore()
				storageStore.$reset()
				await storageStore.GET_TREE()
				$snackBar.success('User storage has been reset')
			} catch (error) {
				console.error(error)
			}
		},
		async UPDATE_REPO(repository) {
			try {
				if (typeof repository !== 'object' && repository === null) {
					throw new Error('Payload of repository not correct')
				}

				if (helpers.isEqualObjects(this.repository, repository)) return

				this.repoLoading = true
				await Repository.updateRepository(repository)
			} catch (error) {
				console.warn(error)
				$snackBar.error('Update repository error')
			} finally {
				this.repoLoading = false
			}
		},
		async GET_REPO() {
			try {
				const res = await Repository.getRepository()
				if (res?.data) {
					const { data: repository } = res
					this.repository = repository
					return repository
				}
			} catch (error) {
				console.error(error)
			}
		}
	}
})
