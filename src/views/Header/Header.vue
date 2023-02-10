<template>
	<q-header elevated>
		<q-toolbar>
			<q-btn
				flat
				dense
				round
				@click="appStore.SET_DRAWER_STATE(!appStore.leftDrawerState)"
				aria-label="Menu"
				icon="menu"
			/>

			<q-toolbar-title> Cloud storage </q-toolbar-title>

			<HeaderMenu />
		</q-toolbar>
	</q-header>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import HeaderMenu from '@/views/Header/HeaderMenu/HeaderMenu.vue'

const appStore = useAppStore()
</script>
