<template>
	<q-table
		:loading="storageStore.isFolderContentLoading"
		:title="storageStore.searchValue ? 'Search result' : 'Folder data'"
		:rows="storageStore.folderData"
		:columns="columns"
		row-key="id"
	>
		<template v-slot:top>
			<q-btn
				:disable="isDisableHistoryBtns || storageStore.history[0]?.open"
				flat
				round
				icon="arrow_back_ios"
				color="grey"
				size="sm"
				@click="historyHandler(true)"
			/>
			<q-btn
				:disable="isDisableHistoryBtns || storageStore.history.at(-1)?.open"
				flat
				round
				icon="arrow_forward_ios"
				color="grey"
				size="sm"
				@click="historyHandler(false)"
			/>
		</template>
		<template v-slot:header="props">
			<q-tr :props="props">
				<q-th auto-width />
				<q-th v-for="col in props.cols" :key="col.name" :props="props">
					{{ col.label }}
				</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr :props="props" @dblclick="tableNodeEvent(props.row)">
				<q-menu touch-position context-menu>
					<q-list dense style="min-width: 100px">
						<template v-for="item in contextMenuItems" :key="item.key">
							<q-item
								v-if="item.condition(props.row)"
								:disable="props.row.isDownloading"
								clickable
								v-close-popup
								@click="item.handle(props.row)"
							>
								<q-item-section>{{ item.name(props.row) }}</q-item-section>
							</q-item>
						</template>
					</q-list>
				</q-menu>
				<q-td auto-width>
					<q-btn
						v-if="props.row.isDownloading"
						flat
						round
						icon="close"
						color="red"
						size="xs"
						@click="filesStore.ABORT_DOWNLOAD_FILE(props.row)"
					/>

					<q-icon
						v-else
						:name="props.row.type === 'dir' ? 'folder' : 'description'"
						:color="getIconColor(props.row)"
						size="sm"
					/>
					<q-linear-progress v-if="props.row.isDownloading" indeterminate rounded />
				</q-td>
				<q-td v-for="col in props.cols" :key="col.name" :props="props">
					{{ col.value }}
				</q-td>
			</q-tr>
		</template>
	</q-table>
</template>

<script setup>
import { useStorageStore } from '@/store/storage'
import { useFilesStore } from '@/store/files'
import { columns } from '@/constants/cloudTable'
import { computed } from 'vue'

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
		name: () => 'Open folder',
		condition: node => node.type === 'dir',
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

const isDisableHistoryBtns = computed(
	() => !storageStore.history.length || storageStore.isFolderContentLoading
)

const getIconColor = node => {
	return node.children.length ? '' : node.type === 'dir' ? 'grey-5' : ''
}

const tableNodeEvent = node => {
	if (node.type === 'dir') storageStore.SET_SELECTED(node.id)
	else filesStore.DOWNLOAD_FILE(node)
}

const historyHandler = isPrev => {
	const currentIndex = storageStore.history.findIndex(folder => folder.open)
	if (currentIndex !== -1) {
		const newIndex = isPrev ? currentIndex - 1 : currentIndex + 1
		storageStore.SET_SELECTED(storageStore.history[newIndex].folderId, true)
	}
}
</script>
