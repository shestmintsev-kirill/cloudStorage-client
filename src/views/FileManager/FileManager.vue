<template>
	<div class="q-pa-md q-gutter-sm full-height">
		<ToolbarBtns @createFolder="createFolder(storageStore.selected)" @createFile="createFile" />

		<q-input
			v-model="storageStore.searchValue"
			label="Search files"
			@update:model-value="value => storageStore.SEARCH_REQUEST(value)"
		>
			<template v-slot:append>
				<q-icon
					name="close"
					class="cursor-pointer"
					@click.stop.prevent="storageStore.searchValue = ''"
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
				<FoldersTree v-show="!isLoading" :contextMenuItems="contextMenuItems" />
			</template>

			<template v-slot:after>
				<CloudTable
					v-if="storageStore.selected || storageStore.searchValue"
					:contextMenuItems="contextMenuItems"
				/>
			</template>
		</q-splitter>
		<q-separator class="q-mt-none" />
	</div>
</template>

<script setup>
import FileUploader from '@/components/Uploader/FileUploader.vue'
import ToolbarBtns from '@/components/FileManager/ToolbarBtns.vue'
import FoldersTree from '@/components/FileManager/FoldersTree.vue'
import { useAppStore } from '@/store/app'
import { useStorageStore } from '@/store/storage'
import CloudTable from '@/components/FileManager/CloudTable.vue'
import { computed, onMounted, watch } from 'vue'
import $app from '@/utils/app'
import { useQuasar } from 'quasar'
import { useFilesStore } from '@/store/files'

const $q = useQuasar()
const appStore = useAppStore()
const storageStore = useStorageStore()
const filesStore = useFilesStore()

const contextMenuItems = [
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
	(newValue, oldValue) => {
		const oldIsBigger = oldValue.length > newValue.length
		const findFolderId = oldIsBigger
			? oldValue.find(id => newValue.indexOf(id) === -1)
			: newValue.find(id => oldValue.indexOf(id) === -1)
		if (!findFolderId) return
		const node = $app.findElementInDeepArray(
			storageStore.filesTree,
			item => item.id === findFolderId
		)
		if (node) node.icon = oldIsBigger ? 'folder' : 'folder_open'
		localStorage.expanded = JSON.stringify(newValue)
	}
)

onMounted(() => {
	appStore.SET_DRAWER_STATE(false)
	storageStore.GET_TREE_ACCORDING_PAST_LVL()
})

const createFile = async () => {
	$q.dialog({
		component: FileUploader,
		componentProps: {
			selectedFolderId: storageStore.selected,
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
