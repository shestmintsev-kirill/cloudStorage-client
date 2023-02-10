<template>
	<div class="q-pa-md" style="max-width: 400px">
		<h3>{{ isRegistration ? 'Registration' : 'Login' }}</h3>
		<q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
			<q-input
				filled
				v-model.trim="email"
				label="Email"
				lazy-rules
				:rules="[val => (val && val.length > 0) || 'Please type something']"
			/>

			<q-input
				v-model.trim="password"
				filled
				label="Password"
				:type="isPwd ? 'password' : 'text'"
			>
				<template v-slot:append>
					<q-icon
						:name="isPwd ? 'visibility_off' : 'visibility'"
						class="cursor-pointer"
						@click="isPwd = !isPwd"
					/>
				</template>
			</q-input>

			<div>
				<q-btn label="Login" type="submit" color="primary" />
				<q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
			</div>
		</q-form>
	</div>
</template>

<script setup>
import { Auth } from '@/api/auth'
import { useAppStore } from '@/store/app'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import $snackBar from '@/utils/snackBar'

const { SET_USER } = useAppStore()
const route = useRoute()
const router = useRouter()

const email = ref(null)
const password = ref(null)
const isPwd = ref(true)

const isRegistration = computed(() => route.name === 'Registration')

const onSubmit = async () => {
	try {
		const ApiMethod = isRegistration.value ? Auth.registration : Auth.login
		const res = await ApiMethod({
			email: email.value,
			password: password.value
		})
		if (!isRegistration.value && res.status === 200) {
			SET_USER(res.data)
		}
		if (isRegistration.value ? res.data.message : res.data?.token) {
			$snackBar.success(isRegistration.value ? res.data.message : 'Submitted')
			router.push(isRegistration.value ? '/login' : '/files')
		}
	} catch (error) {
		console.log(error)
		$snackBar.error('Error')
	}
}

const onReset = () => {
	email.value = null
	password.value = null
}
</script>
