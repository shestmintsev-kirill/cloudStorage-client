<template>
	<q-btn round color="primary" icon="add">
		<q-menu :offset="[0, 11]" anchor="center right" self="center left">
			<q-list>
				<q-item clickable v-close-popup @click="emit('createFolder')">
					<q-item-section side class="q-pr-md">
						<q-icon size="20px" color="" name="folder" />
					</q-item-section>
					<q-item-section>Create folder</q-item-section>
				</q-item>
				<q-item
					:disable="!storageStore.selected"
					clickable
					v-close-popup
					@click="emit('createFile')"
				>
					<q-item-section side class="q-pr-md">
						<q-icon size="20px" color="" name="description" />
					</q-item-section>
					<q-item-section>Create file</q-item-section>
				</q-item>
			</q-list>
		</q-menu>
	</q-btn>
	<q-btn round color="primary" icon="refresh" @click="storageStore.GET_TREE_ACCORDING_PAST_LVL" />
</template>

<script setup>
import { useStorageStore } from '@/store/storage'

const emit = defineEmits(['createFile', 'createFolder'])

const storageStore = useStorageStore()
</script>
