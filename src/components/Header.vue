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
					<q-avatar size="lg">
						<q-img no-spinner v-if="avatar" :src="'http://localhost:3000/' + avatar" />
						<img v-else src="@/assets/avatar_default.svg" alt="avatar" />
						<q-menu
							:offset="[1, 10]"
							style="width: 200px"
							transition-hide="scale"
							ref="userMenu"
						>
							<q-list>
								<q-item-label header>{{
									appStore.getCurrentUser?.email || ''
								}}</q-item-label>
								<input
									accept="image/*"
									ref="fileInput"
									v-show="false"
									type="file"
									@change="uploadAvatar"
								/>
								<q-item clickable @click="avatarEvent">
									<q-item-section side class="q-pr-md">
										<template v-if="!!appStore.avatarUploadController">
											<q-btn
												flat
												round
												icon="close"
												color="red"
												size="xs"
												@click.prevent="
													appStore.avatarUploadController.abort()
												"
											/>
											<q-linear-progress indeterminate />
										</template>
										<q-icon
											v-else
											size="20px"
											:name="avatar ? 'delete' : 'upload'"
										/>
									</q-item-section>
									<q-item-section>{{ avatarBtnText }}</q-item-section>
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
import { computed, ref } from 'vue'
import $snackBar from '@/utils/snackBar'

const appStore = useAppStore()
const router = useRouter()

const fileInput = ref(null)
const userMenu = ref(null)

const avatar = computed(() => appStore.currentUser.avatar)
const avatarBtnText = computed(() =>
	avatar.value
		? 'Remove avatar'
		: `${appStore.avatarUploadController ? 'Avatar is uploading' : 'Upload avatar'}`
)

const logout = () => {
	appStore.SET_USER(null)
	router.push('/login')
	$snackBar.success('Logout')
}

const avatarEvent = async () => {
	if (appStore.avatarUploadController) return
	if (avatar.value) {
		await appStore.REMOVE_AVATAR()
		userMenu.value?.hide()
	} else fileInput.value.click()
}

const uploadAvatar = async () => {
	await appStore.UPLOAD_AVATAR(fileInput.value.files[0])
	userMenu.value?.hide()
}
</script>
