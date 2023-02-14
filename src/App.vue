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
import { useQueryProvider } from 'vue-query'
import Header from '@/views/Header/Header.vue'
import Drawer from '@/views/Drawer/Drawer.vue'

useQueryProvider()
</script>
