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

			<template v-if="appStore.getIsAuth">
				<q-btn flat round color="domrf-primary">
					<q-avatar size="md" icon="person">
						<q-menu :offset="[1, 10]">
							<q-list>
								<q-item-label header>{{
									appStore.getCurrentUser?.email || ''
								}}</q-item-label>
								<input
									ref="fileInput"
									v-show="false"
									type="file"
									@change="changeFile"
								/>
								<q-item clickable @click="uploadAvatar">
									<q-item-section side class="q-pr-md">
										<q-icon size="20px" name="upload" />
									</q-item-section>
									<q-item-section>Upload avatar</q-item-section>
								</q-item>
								<q-item clickable @click="logout">
									<q-item-section side class="q-pr-md">
										<q-icon size="20px" name="logout" />
									</q-item-section>
									<q-item-section>Logout</q-item-section>
								</q-item>
							</q-list>
						</q-menu>
					</q-avatar>
				</q-btn>
			</template>
			<template v-else>
				<q-btn
					class="q-mr-md"
					round
					color="secondary"
					icon="login"
					@click="$router.push('/login')"
				>
					<q-tooltip
						class="text-body2"
						anchor="bottom middle"
						self="top middle"
						:offset="[10, 10]"
					>
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
					<q-tooltip
						class="text-body2"
						anchor="bottom middle"
						self="top middle"
						:offset="[10, 10]"
					>
						Registration
					</q-tooltip>
				</q-btn>
			</template>
		</q-toolbar>
	</q-header>
</template>

<script setup>
import { useAppStore } from '@/store/app'
import { useRouter } from 'vue-router'
import $snackBar from '@/utils/snackBar'
import { ref } from 'vue'

const appStore = useAppStore()
const router = useRouter()

const fileInput = ref(null)

const logout = () => {
	appStore.SET_USER(null)
	router.push('/login')
	$snackBar.success('Logout')
}

const uploadAvatar = () => fileInput.value.click()

const changeFile = () => {
	console.log(fileInput.value.files)
}
</script>
