import { useFilesStore } from '@/store/files'
import { useAppStore } from '@/store/app'
import { instance } from './api'

export const Files = {
	async getFiles(parent, sort) {
		try {
			const res = await instance.get('api/files/', { params: { parent, sort } })
			return res
		} catch (error) {
			console.log(error.response.data.message)
		}
	},
	async createFolder({ name, parent, type }) {
		try {
			const body = {
				name,
				type
			}
			if (parent) body.parent = parent
			const res = await instance.post('api/files/', body)
			return res
		} catch (error) {
			console.log(error.response.data.message)
		}
	},
	async uploadFile(files, folderId) {
		try {
			const formData = new FormData()
			formData.append('file', files)
			formData.append('fileName', files.name)
			if (folderId) {
				formData.append('parent', folderId)
			}
			const controller = new AbortController()
			const uploadFile = { name: files.name, progress: 0, controller }
			const filesStore = useFilesStore()
			filesStore.SET_FILE(uploadFile)
			const res = await instance.post('api/files/upload', formData, {
				signal: controller.signal,
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				onUploadProgress: progressEvent => {
					const totalLength = progressEvent.lengthComputable
						? progressEvent.total
						: progressEvent.target.getResponseHeader('content-length') ||
						  progressEvent.target.getResponseHeader('x-decompressed-content-length')
					if (totalLength) {
						const progress =
							Math.round((progressEvent.loaded * 100) / totalLength) / 100

						const fileProgress = filesStore.progressFiles.find(
							file => file.name === uploadFile.name
						)

						if (progress !== fileProgress.progress) fileProgress.progress = progress
					}
				}
			})
			return res
		} catch (error) {
			console.warn(error)
			return error
		}
	},
	async downloadFile(file, controller) {
		try {
			const res = await instance.get(
				'api/files/download',
				{
					signal: controller.signal,
					params: {
						id: file.id
					},
					responseType: 'blob'
				},
				{}
			)
			if (res.status === 200) {
				const blob = res.data
				const downloadUrl = window.URL.createObjectURL(blob)
				const link = document.createElement('a')
				link.href = downloadUrl
				link.download = file.name
				document.body.appendChild(link)
				link.click()
				link.remove()
			}
		} catch (error) {
			console.log(error)
		}
	},
	async deleteNode(file) {
		try {
			const res = await instance.delete('api/files/', {
				params: {
					id: file.id
				}
			})
			return res
		} catch (error) {
			console.log(error.response.data.message)
		}
	},
	async searchFiles(search) {
		try {
			const res = await instance.get('api/files/search', {
				params: {
					search
				}
			})
			return res
		} catch (error) {
			console.log(error.response.data.message)
		}
	},
	async uploadAvatar(files) {
		try {
			const formData = new FormData()
			formData.append('file', files)
			const appStore = useAppStore()
			appStore.avatarUploadController = new AbortController()
			const res = await instance.post('api/files/avatar', formData, {
				signal: appStore.avatarUploadController.signal,
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
			return res
		} catch (error) {
			console.warn(error)
			return error
		}
	},
	async removeAvatar() {
		try {
			const res = await instance.delete('api/files/avatar')
			return res
		} catch (error) {
			console.warn(error)
			return error
		}
	}
}
