<template>
	<div class="q-pa-md">
		<q-tree
			ref="tree"
			node-key="id"
			:nodes="storageStore.filesTree"
			v-model:selected="storageStore.selected"
			v-model:expanded="storageStore.expanded"
			@lazy-load="storageStore.OPEN_FOLDER"
		>
			<template v-slot:default-header="prop">
				<div v-if="prop.node.icon" class="row items-center">
					<q-icon :name="prop.node.icon" size="26px" class="q-mr-sm" />
					<div>
						{{ labelForTree(prop.node.label) }}
						<q-tooltip class="text-body2">{{ prop.node.label }}</q-tooltip>
					</div>
				</div>
				<ContextMenu :contextMenuElements="storageContextMenu" :targetElement="prop.node" />
			</template>
		</q-tree>
	</div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useStorageStore } from '@/store/storage'
import ContextMenu from '@/components/ContextMenu/ContextMenu.vue'

defineProps({
	storageContextMenu: {
		type: Array,
		required: true,
		default: () => []
	}
})

const storageStore = useStorageStore()

const tree = ref(null)

const labelForTree = label => (label.length > 20 ? `${label?.substr(0, 20)}...` : label)

onMounted(() => {
	storageStore.treeRef = tree
})

watch(
	computed(() => storageStore.selected),
	newNodeId => {
		try {
			localStorage.selected = JSON.stringify(newNodeId)
			if (newNodeId) {
				tree.value.setExpanded(newNodeId, true)
				storageStore.SET_FOLDER_CONTENT(newNodeId)
			}
		} catch (error) {
			console.error(error)
		}
	}
)
</script>
