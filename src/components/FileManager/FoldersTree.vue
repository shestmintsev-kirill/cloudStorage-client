<template>
	<div class="q-pa-md">
		<q-tree
			ref="tree"
			default-expand-all
			node-key="id"
			:nodes="storageStore.filesTree"
			v-model:selected="storageStore.selected"
			v-model:expanded="storageStore.expanded"
			@lazy-load="storageStore.OPEN_FOLDER"
		/>
	</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStorageStore } from '@/store/storage'

const storageStore = useStorageStore()

const tree = ref(null)

watch(
	computed(() => storageStore.selected),
	newNodeId => {
		if (newNodeId) {
			tree.value.setExpanded(newNodeId, true)
			storageStore.SET_FOLDER_CONTENT(newNodeId)
		}
	}
)
</script>
