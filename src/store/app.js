import { defineStore } from 'pinia'
import $snackBar from '@/services/snackBar'
import { UserStorage } from '@/services/userStorage'
import router from '@/router'
import { useStorageStore } from './storage'
import { useRepositoryStore } from './repository'

export const useAppStore = defineStore('app', {
	state: () => ({
		currentUser: null,
		leftDrawerState: false,
		isAuth: false,
		avatarUploadController: null
	}),
	getters: {
		getCurrentUser: state => state.currentUser,
		getIsAuth: state => state.isAuth
	},
	actions: {
		async SET_USER(payload) {
			if (payload) {
				const { id, email, token } = payload
				if (!UserStorage.getItem('user-name')?.includes(id)) {
					UserStorage.create(`${email}_${id}`)
				}

				UserStorage.setItem('cloudToken', token)

				const repoStore = useRepositoryStore()
				await repoStore.GET_REPO()
			} else UserStorage.removeItem('cloudToken')
			this.currentUser = payload
			this.isAuth = !!payload
		},
		SET_DRAWER_STATE(payload) {
			this.leftDrawerState = payload
		},
		async UPLOAD_AVATAR(files) {
			try {
				const module = await import('@/api/files')
				const res = await module.Files.uploadAvatar(files)
				if (res?.data?.avatar) {
					this.currentUser.avatar = res?.data?.avatar
					$snackBar.success('Uploaded avatar')
				} else if (res?.message === 'canceled') $snackBar.success('Upload canceled')
			} catch (error) {
				console.warn(error)
				$snackBar.error('Upload error')
			} finally {
				this.avatarUploadController = null
			}
		},
		async REMOVE_AVATAR() {
			try {
				const module = await import('@/api/files')
				const res = await module.Files.removeAvatar()
				if (res.status === 200) {
					this.currentUser.avatar = null
					$snackBar.success('Removed avatar')
				}
			} catch (error) {
				console.warn(error)
				$snackBar.error('Remove error')
			}
		},
		async LOGOUT() {
			const storageStore = useStorageStore()
			await this.SET_USER(null)
			storageStore.$reset()
			UserStorage.removeAll()
			router.push('/login')
			$snackBar.success('Logout')
		}
	}
})
