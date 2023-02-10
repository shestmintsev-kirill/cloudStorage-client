<template>
	<template v-if="appStore.getIsAuth">
		<q-btn flat round color="domrf-primary">
			<q-avatar size="lg">
				<q-img no-spinner v-if="avatar" :src="'http://localhost:3000/' + avatar" />
				<img v-else src="@/assets/avatar_default.svg" alt="avatar" />
				<AuthMenu />
			</q-avatar>
		</q-btn>
	</template>
	<template v-else>
		<UnauthMenu />
	</template>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { computed } from 'vue'
import UnauthMenu from '@/views/Header/HeaderMenu/UnauthContextMenu/UnauthMenu.vue'
import AuthMenu from '@/views/Header/HeaderMenu/AuthContextMenu/AuthMenu.vue'

const appStore = useAppStore()

const avatar = computed(() => appStore.currentUser.avatar)
</script>
