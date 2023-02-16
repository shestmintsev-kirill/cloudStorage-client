<template>
	<q-menu :offset="[1, 10]" style="width: 200px" transition-hide="scale" ref="userMenu">
		<q-list>
			<q-item-label header>{{ appStore.getCurrentUser?.email || '' }}</q-item-label>
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
							@click.prevent="appStore.avatarUploadController.abort()"
						/>
						<q-linear-progress indeterminate />
					</template>
					<q-icon v-else size="20px" :name="avatar ? 'delete' : 'upload'" />
				</q-item-section>
				<q-item-section>{{ avatarBtnText }}</q-item-section>
			</q-item>
			<q-item clickable @click="repositoryStore.RESET_REPO" :disable="isRepoDisabled">
				<q-item-section side class="q-pr-md">
					<q-icon size="20px" name="cloud_off" />
				</q-item-section>
				<q-item-section>Reset repository</q-item-section>
			</q-item>
			<q-item clickable @click="appStore.LOGOUT">
				<q-item-section side class="q-pr-md">
					<q-icon size="20px" name="logout" />
				</q-item-section>
				<q-item-section>Logout</q-item-section>
			</q-item>
		</q-list>
	</q-menu>
</template>

<script setup>
import { useRepositoryStore } from '@/store/repository'
import { useAppStore } from '@/store/app'
import { computed, ref } from 'vue'

defineProps({
	isRepoDisabled: {
		type: Boolean,
		required: true,
		default: false
	}
})

const repositoryStore = useRepositoryStore()
const appStore = useAppStore()

const fileInput = ref(null)
const userMenu = ref(null)

const avatar = computed(() => appStore.currentUser.avatar)
const avatarBtnText = computed(() =>
	avatar.value
		? 'Remove avatar'
		: `${appStore.avatarUploadController ? 'Avatar is uploading' : 'Upload avatar'}`
)

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
