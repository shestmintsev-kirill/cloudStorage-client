import { defineStore } from 'pinia'
import { Files } from '@/api/files'
import $app from '@/utils/app'
import $snackBar from '@/utils/snackBar'

export const useStorageStore = defineStore('storage', {
	state: () => ({
		filesTree: [],
		expanded: [],
		folderData: [],
		history: [],
		splitterModel: 30,
		selected: null,
		sort: null,
		searchValue: '',
		isPauseForHistory: false,
		isFolderContentLoading: false,
		isTreeLoading: false
	}),
	getters: {
		getSelectedNode: state => {
			return $app.findElementInDeepArray(state.filesTree, item => item.id === state.selected)
		}
	},
	actions: {
		async GET_TREE(sortType) {
			try {
				this.isTreeLoading = true
				const res = await Files.getFiles(null, sortType)
				this.filesTree = this.PREPARED_FOLDER_DATA(res.data, 1)
			} catch (error) {
				console.error(error)
			} finally {
				this.isTreeLoading = false
			}
		},
		async GET_FOLDER_CONTENT(folderId) {
			if (!folderId) return
			this.isFolderContentLoading = true
			const res = await Files.getFiles(folderId)
			this.folderData = this.PREPARED_FOLDER_DATA(res.data)
			this.history.forEach(folder => {
				folder.open = false
			})
			const existFolder = this.history.find(folder => folder.folderId === folderId)
			if (existFolder) existFolder.open = true
			if (!this.isPauseForHistory && !existFolder) {
				this.history.push({ open: true, folderId })
			}
			this.isPauseForHistory = false
			this.isFolderContentLoading = false
		},
		PREPARED_FOLDER_DATA(nodes, lvl, isOnlyFolders) {
			if (lvl > 1) localStorage.lvl = lvl
			const preparedNodes = nodes.map(node => ({
				...node,
				lvl,
				id: node._id,
				size: $app.formatSize(node.size),
				icon: node.type === 'dir' ? 'folder' : 'description',
				label: node.name,
				lazy: !!node.children.length,
				isDownloading: false
			}))
			if (isOnlyFolders) return preparedNodes.filter(node => node.type === 'dir')
			return preparedNodes
		},
		async SEARCH_REQUEST(search) {
			if (search?.length) {
				this.isFolderContentLoading = true
				clearTimeout(this.timeout)
				this.timeout = setTimeout(async () => {
					this.SET_SELECTED(null)
					const res = await Files.searchFiles(search)
					this.folderData = this.PREPARED_FOLDER_DATA(res.data)
					this.isFolderContentLoading = false
				}, 500)
			} else this.GET_FOLDER_CONTENT(this.selected)
		},
		SET_SELECTED(id, withoutHistory) {
			if (withoutHistory) this.isPauseForHistory = true
			this.selected = id
		},
		SET_FOLDER_CONTENT(nodeId) {
			this.searchValue = ''
			this.GET_FOLDER_CONTENT(nodeId)
		},
		async GET_TREE_ACCORDING_PAST_LVL() {
			try {
				this.isTreeLoading = true
				this.expanded = []
				this.filesTree = []
				await this.GET_TREE()
				// TODO to make update tree to last lvl
				// const savedLvl = +localStorage?.lvl ?? 1
				// const updateRecursiveFn = async nodes => {
				// 	for (const node of nodes) {
				// 		console.log(node)
				// 		if (this.expanded.includes(node.id)) node.icon = 'folder_open'
				// 		if (node.lvl > savedLvl || !node.children.length) return
				// 		const res = await Files.getFiles(node.id)
				// 		node.children = this.PREPARED_FOLDER_DATA(res.data, node.lvl + 1, true)
				// 		await updateRecursiveFn(node.children)
				// 	}
				// }
				// await updateRecursiveFn(this.filesTree)
			} catch (error) {
				console.error(error)
			} finally {
				this.isTreeLoading = false
			}
		},
		async OPEN_FOLDER({ node, key, done }) {
			if (key.indexOf('Lazy load empty') > -1) {
				done([])
				return
			}
			if (node?.id) {
				const res = await Files.getFiles(node.id)
				const childNodes = this.PREPARED_FOLDER_DATA(res.data, node.lvl + 1, true)
				done(childNodes)
			}
		},
		async CREATE_FOLDER(name) {
			try {
				const res = await Files.createFolder({
					name,
					type: 'dir',
					parent: this.selected
				})
				if (res.status === 200) {
					const response = await Files.getFiles(this.selected)

					const updatedNode = $app.findElementInDeepArray(
						this.filesTree,
						item => item.id === this.selected
					)

					if (updatedNode) {
						updatedNode.children = this.PREPARED_FOLDER_DATA(
							response.data,
							updatedNode + 1,
							true
						)
					} else this.GET_TREE()

					$snackBar.success('Folder created')
				}
			} catch (error) {
				console.log(error)
			}
		},
		async DELETE_NODE(node) {
			// const parentName = node.path.split('/').at(-2)
			// if (parentName) {
			// 	const parentNode = $app.findElementInDeepArray(
			// 		this.filesTree,
			// 		item => item.name === parentName
			// 	)
			// 	if (parentNode.children.length === 1) parentNode.icon = 'folder'
			// }
			const res = await Files.deleteNode(node)
			if (res.statusText === 'OK') {
				if (node.type === 'dir') this.GET_TREE_ACCORDING_PAST_LVL()
				this.GET_FOLDER_CONTENT(this.selected)
				$snackBar.success('Deleted successfully')
			} else {
				$snackBar.error('Deleted failed')
			}
		}
	}
})
