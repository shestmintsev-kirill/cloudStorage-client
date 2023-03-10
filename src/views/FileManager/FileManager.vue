<template>
	<div class="q-pa-md q-gutter-sm full-height">
		<ToolbarBtns @createFolder="createFolder(storageStore.selected)" @createFile="createFile" />

		<q-input
			v-model="storageStore.searchValue"
			label="Search files"
			@update:model-value="value => storageStore.SEARCH_REQUEST(value)"
		>
			<template v-if="storageStore.searchValue.length" v-slot:append>
				<q-icon
					name="close"
					class="cursor-pointer"
					@click.stop.prevent="storageStore.SEARCH_RESET"
				/>
			</template>
		</q-input>

		<!-- <q-select
			label="Sort"
			bottom-slots
			v-model="sort"
			:options="['Name', 'Type', 'Date']"
			@update:model-value="type => getTree(type)"
		>
			<template v-slot:append>
				<q-icon name="close" @click.stop.prevent="sort = null" class="cursor-pointer" />
			</template>
		</q-select> -->

		<q-splitter
			v-model="storageStore.splitterModel"
			style="height: 400px"
			class="full-height q-my-none"
		>
			<template v-slot:before>
				<q-card-section v-show="isLoading">
					<template v-for="i in 2" :key="i">
						<q-skeleton
							v-for="n in 5"
							:key="n"
							type="text"
							:width="`${n + i}0%`"
							height="35px"
							animation="fade"
						/>
					</template>
				</q-card-section>
				<FoldersTree v-show="!isLoading" :storageContextMenu="storageContextMenu" />
			</template>

			<template v-slot:after>
				<CloudTable
					v-if="storageStore.selected || storageStore.searchValue"
					:storageContextMenu="storageContextMenu"
				/>
			</template>
		</q-splitter>
		<q-separator class="q-mt-none" />
	</div>
</template>

<script setup>
import FileUploader from '@/views/FileManager/FileUploader/FileUploader.vue'
import ToolbarBtns from '@/views/FileManager/ToolBar/ToolbarBtns.vue'
import FoldersTree from '@/views/FileManager/Tree/FoldersTree.vue'
import { useAppStore } from '@/store/app'
import { useStorageStore } from '@/store/storage'
import CloudTable from '@/views/FileManager/Table/CloudTable.vue'
import { computed, onMounted, watch } from 'vue'
import $app from '@/helpers'
import { useQuasar } from 'quasar'
import { useFilesStore } from '@/store/files'
import { Files } from '@/api/files'

const $q = useQuasar()
const appStore = useAppStore()
const storageStore = useStorageStore()
const filesStore = useFilesStore()

const storageContextMenu = [
	{
		name: () => 'Download file',
		condition: node => node.type !== 'dir',
		handle: node => {
			filesStore.DOWNLOAD_FILE(node)
		}
	},
	{
		name: () => 'Create folder',
		condition: node => node.type === 'dir',
		handle: node => {
			createFolder(node.id)
		}
	},
	{
		name: () => 'Create file',
		condition: node => node.type === 'dir',
		handle: node => {
			console.log(node.id)
			createFile(node.id)
		}
	},
	{
		name: () => 'Open folder',
		condition: node => node.type === 'dir' && node.id !== storageStore.selected,
		handle: node => {
			storageStore.SET_SELECTED(node.id)
		}
	},
	{
		name: node => `Delete ${node.type === 'dir' ? 'folder' : 'file'}`,
		condition: () => true,
		handle: node => {
			storageStore.DELETE_NODE(node)
		}
	}
]

const isLoading = computed(() => storageStore.isTreeLoading || storageStore.storageLoading)

watch(
	computed(() => storageStore.expanded),
	async (newValue, oldValue) => {
		const oldIsBigger = oldValue.length > newValue.length
		const findFolderId = oldIsBigger
			? oldValue.find(id => newValue.indexOf(id) === -1)
			: newValue.find(id => oldValue.indexOf(id) === -1)
		if (!findFolderId) return
		const node = $app.findElementInDeepArray(
			storageStore.filesTree,
			item => item.id === findFolderId
		)
		if (node) {
			if (!oldIsBigger && node.children.every(child => typeof child === 'string')) {
				const res = await Files.getFiles(node.id)
				node.children = storageStore.PREPARED_FOLDER_DATA(res.data, true)
			}
			node.icon = oldIsBigger ? 'folder' : 'folder_open'
		}
	}
)

onMounted(() => {
	appStore.SET_DRAWER_STATE(false)
	storageStore.GET_TREE_ACCORDING_PAST_LVL()
})

const createFile = async (selectedFolderId = storageStore.selected) => {
	$q.dialog({
		component: FileUploader,
		componentProps: {
			selectedFolderId,
			updateFn: () => {
				storageStore.GET_FOLDER_CONTENT(storageStore.selected)
			}
		}
	})
}

const createFolder = async parentId => {
	$q.dialog({
		title: 'Create new folder',
		message: 'Folder name',
		prompt: {
			model: '',
			type: 'text' // optional
		},
		cancel: true,
		persistent: true
	})
		.onOk(async name => {
			await storageStore.CREATE_FOLDER(name, parentId)
			if (storageStore.selected) storageStore.GET_FOLDER_CONTENT(storageStore.selected)
		})
		.onCancel(() => {})
		.onDismiss(() => {})
}
</script>
