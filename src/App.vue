<template>
	<q-layout view="lHh Lpr lFf">
		<Header />
		<Drawer />
		<q-page-container>
			<router-view />
		</q-page-container>
	</q-layout>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { Auth } from '@/api/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQueryProvider } from 'vue-query'
import Header from '@/components/Header.vue'
import Drawer from '@/components/Drawer.vue'
import $snackBar from '@/utils/snackBar'

useQueryProvider()

const appStore = useAppStore()
const router = useRouter()

onMounted(() => {
	init()
})

const init = () => {
	Auth.auth().then(res => {
		try {
			appStore.SET_USER(res.data)
		} catch (error) {
			console.log(error)
			$snackBar.warning('You are not authorized')
			router.push('/login')
		}
	})
}
</script>
