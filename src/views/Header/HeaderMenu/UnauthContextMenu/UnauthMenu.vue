<template>
	<q-btn class="q-mr-md" round color="secondary" icon="login" @click="$router.push('/login')">
		<q-tooltip class="text-body2" anchor="bottom middle" self="top middle" :offset="[10, 10]">
			Sign in
		</q-tooltip>
	</q-btn>
	<q-btn
		class="q-mr-md"
		round
		color="secondary"
		icon="app_registration"
		@click="$router.push('/registration')"
	>
		<q-tooltip class="text-body2" anchor="bottom middle" self="top middle" :offset="[10, 10]">
			Registration
		</q-tooltip>
	</q-btn>
</template>

<script setup></script>
