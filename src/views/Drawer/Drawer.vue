<template>
	<q-drawer v-model="appStore.leftDrawerState" show-if-above bordered class="bg-grey-2">
		<q-list>
			<q-item-label header>Menu</q-item-label>
			<q-item
				v-for="menu in preparedMenuItems"
				:key="menu.path"
				clickable
				@click="$router.push(menu.path)"
			>
				<q-item-section avatar>
					<q-icon :name="menu.icon" />
				</q-item-section>
				<q-item-section>
					<q-item-label>{{ menu.label }}</q-item-label>
				</q-item-section>
			</q-item>
		</q-list>
	</q-drawer>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { computed } from 'vue'
const menuItems = [
	{ label: 'Registration', path: '/registration', icon: 'school' },
	{ label: 'Login', path: '/login', icon: 'login' },
	{ label: 'Files', path: '/files', icon: 'cloud' }
]
const appStore = useAppStore()
const preparedMenuItems = computed(() =>
	appStore.getIsAuth ? menuItems.slice(2) : menuItems.slice(0, -1)
)
</script>
