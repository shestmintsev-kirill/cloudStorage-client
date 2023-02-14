<template>
	<q-table
		:loading="storageStore.isFolderContentLoading"
		:title="storageStore.searchValue ? 'Search result' : 'Folder data'"
		:rows="storageStore.folderData"
		:columns="models.storageModel.columns"
		:visible-columns="visibleColumns"
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
				class="q-mr-md"
				icon="arrow_forward_ios"
				color="grey"
				size="sm"
				@click="historyHandler(false)"
			/>
			<q-select
				v-model="visibleColumns"
				multiple
				borderless
				dense
				options-dense
				emit-value
				map-options
				display-value=""
				:options="models.storageModel.columns"
				option-value="name"
				options-cover
			>
				<template v-slot:append>
					<q-icon name="visibility" class="cursor-pointer" />
				</template>
			</q-select>
			<q-space />
			<q-breadcrumbs active-color="grey-7" class="q-mt-sm">
				<template v-slot:separator>
					<q-icon size="1.2em" name="arrow_forward" color="grey-8" />
				</template>
				<q-breadcrumbs-el
					v-for="(el, index) in breadCrumbs"
					:key="index"
					:label="el"
					icon="folder"
				/>
			</q-breadcrumbs>
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
				<ContextMenu :contextMenuElements="storageContextMenu" :targetElement="props.row" />
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
import models from '@/models'
import { computed, ref } from 'vue'
import ContextMenu from '@/components/ContextMenu/ContextMenu.vue'

defineProps({
	storageContextMenu: {
		type: Array,
		required: true,
		default: () => []
	}
})

const storageStore = useStorageStore()
const filesStore = useFilesStore()

const visibleColumns = ref(['name', 'size', 'date'])

const isDisableHistoryBtns = computed(
	() => !storageStore.history.length || storageStore.isFolderContentLoading
)
const breadCrumbs = computed(
	() =>
		storageStore.getSelectedNode?.path?.split('/') ??
		storageStore.folderData?.[0]?.path.split('/').slice(0, -1)
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
