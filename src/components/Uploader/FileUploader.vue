<template>
	<dialog-draggable-resizable
		:seamless="false"
		id="file-uploader"
		:model-value="mdVal"
		title="Files upload"
		:content-width="790"
		:contentMinHeight="470"
		:content-min-width="280"
		@onHide="onDialogHide"
		class="q-pa-none"
	>
		<div class="column justify-between full-height">
			<q-card-section class="row">
				<q-uploader
					class="col-12"
					ref="uploader"
					multiple
					batch
					hide-upload-btn
					@added="filesStore.UPLOADED"
					@removed="filesStore.REMOVE_UPLOAD_FILES"
				>
					<template v-slot:header="scope">
						<div class="row no-wrap items-center q-pa-sm q-gutter-xs">
							<q-btn
								v-if="scope.queuedFiles.length > 0"
								icon="clear_all"
								@click="scope.removeQueuedFiles"
								round
								dense
								flat
							>
								<q-tooltip>Clear All</q-tooltip>
							</q-btn>
							<div class="col">
								<div class="q-uploader__title">Overall size</div>
								<div class="q-uploader__subtitle">
									{{ scope.uploadSizeLabel }}
								</div>
							</div>
							<q-btn
								:loading="!!filesStore.progressFiles.length"
								v-if="scope.canAddFiles"
								type="a"
								icon="add_box"
								@click="scope.pickFiles"
								round
								dense
								flat
							>
								<q-uploader-add-trigger />
								<q-tooltip>Pick Files</q-tooltip>
							</q-btn>
						</div>
					</template>
					<template v-slot:list="scope">
						<q-list>
							<q-item
								v-for="file in scope.files"
								:key="file.__key"
								class="q-pa-none q-my-xs"
							>
								<q-linear-progress
									:value="filesStore.GET_PROGRESS(file.name)"
									rounded
									color="green-2"
									class="absolute full-height full-width"
									track-color="blue-2"
									stripe
								/>
								<q-item-section class="z-top q-pa-sm">
									<q-item-label class="full-width ellipsis">
										{{ file.name }}
									</q-item-label>

									<q-item-label caption>
										{{ file.__sizeLabel }} /
										{{
											(filesStore.GET_PROGRESS(file.name)
												? (
														filesStore.GET_PROGRESS(file.name) * 100
												  ).toFixed(0)
												: 0) + '%'
										}}
									</q-item-label>
								</q-item-section>

								<q-item-section
									v-if="file.__img"
									thumbnail
									class="gt-xs q-pa-xs z-top"
								>
									<img v-if="file.__img" :src="file.__img.src" />
								</q-item-section>

								<q-item-section top side>
									<q-btn
										class="gt-xs"
										size="12px"
										flat
										dense
										round
										icon="close"
										@click="filesStore.REMOVE_FILE(scope, file)"
									/>
								</q-item-section>
							</q-item>
						</q-list>
					</template>
				</q-uploader>
			</q-card-section>
			<q-card-actions ref="actionBtns" align="right" class="fixed-actions q-pa-lg">
				<q-btn label="Upload" color="blue" @click="onSubmit" />
				<q-btn outline color="blue" label="Cancel" @click="onDialogHide" />
			</q-card-actions>
		</div>
	</dialog-draggable-resizable>
</template>

<script setup>
import useBaseDialog from '@/hooks/useBaseDialog'
import { onUnmounted } from 'vue'
import { useFilesStore } from '@/store/files'

const filesStore = useFilesStore()

const emit = defineEmits(['show', 'hide', 'onDialogHide'])
const props = defineProps({
	updateFn: {
		type: [Function],
		default: () => ({})
	}
})

onUnmounted(() => {
	filesStore.ABORT_LEFT_FILES()
})

const onSubmit = async () => {
	await filesStore.ON_SUBMIT(props.updateFn)
	hide()
}

const { show, hide, onDialogHide, mdVal } = useBaseDialog(emit)

defineExpose({
	show,
	hide,
	onDialogHide,
	mdVal
})
</script>
