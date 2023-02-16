<template>
	<template v-if="appStore.getIsAuth">
		<q-btn flat round color="domrf-primary" class="z-top">
			<q-avatar size="lg" class="avatar">
				<q-img no-spinner v-if="avatar" :src="'http://localhost:3000/' + avatar" />
				<img v-else src="@/assets/avatar_default.svg" alt="avatar" />
				<AuthMenu :isRepoDisabled="repoStore.repoLoading" />
			</q-avatar>
		</q-btn>
		<RepositoryLoader v-if="repoStore.repoLoading" />
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
import RepositoryLoader from '@/views/Header/HeaderMenu/RepositoryLoader/RepositoryLoader.vue'
import { useRepositoryStore } from '@/store/repository'

const appStore = useAppStore()
const repoStore = useRepositoryStore()

const avatar = computed(() => appStore.currentUser.avatar)
</script>
