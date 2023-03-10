import { defineStore } from 'pinia'
import $snackBar from '@/services/snackBar'
import { Files } from '@/api/files'

export const useFilesStore = defineStore('files', {
	state: () => ({
		progressFiles: [],
		files: null
	}),
	actions: {
		SET_FILE(file) {
			this.progressFiles.push(file)
		},
		RESET_UPLOAD_PROCESS() {
			this.progressFiles = []
			this.files = null
		},
		ABORT_LEFT_FILES() {
			if (!this.progressFiles.length) return
			this.files = null
			this.progressFiles.forEach(file => file.controller.abort())
		},
		GET_PROGRESS(fileName) {
			return this.progressFiles.find(progressFile => progressFile.name === fileName)?.progress
		},
		async REMOVE_FILE(scope, removeFile) {
			const progressFile = this.progressFiles.find(
				progressFile => progressFile.name === removeFile.name
			)
			if (progressFile) await progressFile.controller.abort()
			this.files = this.files.filter(file => file.name !== removeFile.name)
			scope.removeFile(removeFile)
		},
		async ON_SUBMIT(updateFn, selectedFolderId) {
			const results = []
			for (const file of this.files) {
				if (this.files?.some(mainFile => mainFile.name === file.name)) {
					const res = await Files.uploadFile(file, selectedFolderId)
					const status = res?.message === 'canceled' ? 'cancel' : res?.statusText || false
					results.push(status)
				}
			}
			if (results.every(status => status === 'cancel')) {
				$snackBar.warning('Upload has been canceled')
			} else if (results.every(status => status === 'OK' || status === 'cancel')) {
				$snackBar.success('Uploaded successfully')
			} else {
				$snackBar.error('Upload failed')
				console.log(results)
			}
			updateFn()
			this.RESET_UPLOAD_PROCESS()
		},
		UPLOADED(givenFiles) {
			if (this.files) this.files = [...this.files, ...givenFiles]
			else this.files = givenFiles
		},
		REMOVE_UPLOAD_FILES(removeFiles) {
			removeFiles.forEach(removeFile => {
				this.files = this.files.filter(file => file.name !== removeFile.name)
			})
		},
		async DOWNLOAD_FILE(node) {
			node.isDownloading = true
			node['controller'] = new AbortController()
			await Files.downloadFile(node, node['controller'])
			node.isDownloading = false
		},
		ABORT_DOWNLOAD_FILE(node) {
			node.controller.abort()
			node.controller = null
			$snackBar.success('Download canceled')
		}
	}
})
