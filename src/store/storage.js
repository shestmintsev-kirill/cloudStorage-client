import { defineStore } from 'pinia'
import { Files } from '@/api/files'
import $app from '@/helpers'
import $snackBar from '@/services/snackBar'

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
		isTreeLoading: false,
		storageLoading: false,
		treeRef: null
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
				this.filesTree = this.PREPARED_FOLDER_DATA(res.data)
			} catch (error) {
				console.error(error)
			} finally {
				this.isTreeLoading = false
			}
		},
		async GET_FOLDER_CONTENT(folderId) {
			if (!folderId) return

			if (localStorage?.history) {
				const lastHistory = JSON.parse(localStorage?.history)
				if (lastHistory && !this.history.length) this.history = lastHistory
			}

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
			localStorage.history = JSON.stringify(this.history)
		},
		PREPARED_FOLDER_DATA(nodes, isOnlyFolders) {
			const preparedNodes = nodes.map(node => ({
				...node,
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
				this.storageLoading = true
				this.filesTree = []
				await this.GET_TREE()

				const expanded = this.expanded.length
					? this.expanded
					: localStorage?.expanded
					? JSON.parse(localStorage.expanded)
					: []

				const acc = []

				const updateRecursiveFn = async nodes => {
					for (const node of nodes) {
						if (expanded.includes(node.id)) {
							this.treeRef.setExpanded(node.id, true)
							if (node.children.length) node.icon = 'folder_open'
							node.lazy = false
							const res = await Files.getFiles(node.id)
							node.children = this.PREPARED_FOLDER_DATA(res.data, true)
							acc.push(node.id)
							await updateRecursiveFn(node.children)
						}
					}
				}
				await updateRecursiveFn(this.filesTree)

				this.expanded = acc
				this.history = this.history.filter(el => this.expanded.includes(el.folderId))

				if (localStorage?.selected) {
					const lastSelectedFolder = JSON.parse(localStorage?.selected)
					if (lastSelectedFolder && !this.selected) {
						this.SET_SELECTED(lastSelectedFolder, true)
					}
				}
			} catch (error) {
				console.error(error)
			} finally {
				this.storageLoading = false
			}
		},
		async OPEN_FOLDER({ node, key, done }) {
			if (key.indexOf('Lazy load empty') > -1) {
				done([])
				return
			}
			if (node?.id) {
				const res = await Files.getFiles(node.id)
				const childNodes = this.PREPARED_FOLDER_DATA(res.data, true)
				done(childNodes)
			}
		},
		async CREATE_FOLDER(name, parentId) {
			try {
				const res = await Files.createFolder({
					name,
					type: 'dir',
					parent: parentId
				})
				if (res?.status === 200) {
					const response = await Files.getFiles(parentId)

					const updatedNode = $app.findElementInDeepArray(
						this.filesTree,
						item => item.id === parentId
					)

					if (updatedNode) {
						updatedNode.icon = 'folder_open'
						updatedNode.children = this.PREPARED_FOLDER_DATA(response.data, true)
					} else this.GET_TREE()

					$snackBar.success('Folder created')
				} else $snackBar.error(res?.message)
			} catch (error) {
				console.error(error)
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
			try {
				const res = await Files.deleteNode(node)
				if (res.statusText === 'OK') {
					this.expanded = this.expanded.filter(id => id !== node.id)
					this.history = this.history.filter(folder => folder.folderId !== node.id)

					if (this.selected === node.id) this.selected = null

					if (node.type === 'dir') await this.GET_TREE_ACCORDING_PAST_LVL()

					await this.GET_FOLDER_CONTENT(this.selected)

					$snackBar.success('Deleted successfully')
				} else $snackBar.error(res?.message ? res.message : 'Deleted failed')
			} catch (error) {
				console.error(error)
				$snackBar.error('Deleted failed')
			}
		}
	}
})
