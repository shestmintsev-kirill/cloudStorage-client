<template>
	<q-dialog
		ref="modal"
		:id="id"
		v-model="dialogModel"
		:persistent="!canClose"
		:seamless="seamless"
		:maximized="maximizedState"
		:position="position"
		:square="square"
		@show="onShow"
		@hide="onHide"
	>
		<q-card
			v-click-back-drop-dialog="{
				clickHandler: hideModalHandlerBackDropLayer,
				selector: `#${id} .q-dialog__backdrop`
			}"
			v-draggable-resizable="{
				id: id,
				isDraggable: draggable,
				isResizable: resizable,
				modalMaxWidth: contentMaxWidth,
				modalMinWidth: contentMinWidth,
				modalMaxHeight: contentMaxHeight,
				modalMinHeight: contentMinHeight,
				defaultWidth: contentWidth,
				defaultHeight: defaultHeight,
				fromFullScreenToCollapsed: fromFullScreenToCollapsed,
				isCollapsed: minimizedState,
				draggableSelector: '.q-bar',
				isFullScreen: maximizedState,
				isAutoHeight: isAutoHeight,
				methods: {
					setFullscreen: setFullscreen,
					unsetMinimizeState: unsetMinimizeState,
					unsetFromFullScreenToCollapsed: unsetFromFullScreenToCollapsed
				}
			}"
			:dark="contentDark"
			:flat="contentFlat"
		>
			<div class="items-center justify-between no-wrap row dialog-navbar relative-position">
				<q-bar class="dragSelector full-width">
					<div class="full-width text-no-wrap overflow-hidden text-overflow-ellipsis">
						{{ title }}
					</div>
				</q-bar>
				<div class="row no-wrap self-stretch">
					<slot name="actions" />
					<q-btn
						v-if="enabledCollapseBtn"
						dense
						flat
						icon="minimize"
						@click="minimizedState ? unsetMinimizeState() : setMinimizeState()"
						class="dialog-header-btn"
					></q-btn>
					<q-btn
						v-if="enabledFullScreenBtn"
						dense
						flat
						@click="maximizedState ? unsetFullscreen() : setFullscreen()"
						class="dialog-header-btn"
					>
						<q-icon
							:name="maximizedState ? 'filter_none' : 'crop_square'"
							:class="{ 'rotate-180': maximizedState }"
							:size="maximizedState ? '20px' : ''"
						></q-icon>
					</q-btn>
					<q-btn
						dense
						flat
						icon="close"
						class="dialog-header-btn"
						@click="hideModalHandler"
					></q-btn>
				</div>
			</div>
			<div class="dialog-content" :style="[{ height: customHeight }, contentStyle]">
				<slot></slot>
			</div>
		</q-card>
	</q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const emit = defineEmits(['onShow', 'onHide', 'confirmClose'])
const props = defineProps({
	id: { type: String, required: true, default: 'dialog' }, // dialog ID, !!! NEEDs TO BE SET IF AMOUNT OF DIALOGS MORE THAN 1
	//Drag and resize
	draggable: { type: Boolean, default: true }, // Enable/Disable drag
	resizable: { type: Boolean, default: true }, // Enable/Disable resize
	// Model
	modelValue: { type: Boolean, default: false }, // Dialog model
	// Dialog options
	persistent: { type: Boolean, default: false }, // User cannot dismiss Dialog if clicking outside of it or hitting ESC key; Also, an app route change won't dismiss it
	seamless: { type: Boolean, default: false }, // Put Dialog into seamless mode; Does not use a backdrop so user is able to interact with the rest of the page too
	maximized: { type: Boolean, default: false }, // Put Dialog into maximized mode
	position: { type: String, default: 'standard' }, // Stick dialog to one of the sides (top, right, bottom or left)
	square: { type: Boolean, default: false }, // Forces content to have squared borders
	// Content
	title: { type: String, default: '' }, // Dialog title
	titleBackground: { type: String, default: 'bg-grey-15' }, // Toolbar background bg-domrf-primary
	titleTextColor: { type: String, default: '' }, // Toolbar text color
	contentWidth: { type: Number, default: 0 }, // Set width to card
	defaultHeight: { type: Number, default: 0 }, // Set height to card forcibly
	contentMaxWidth: { type: Number, default: 0 }, // {Number} Set max-width to card; If set it will not be possible to stretch the window more than this value
	contentMinWidth: { type: Number, default: 0 }, // Min modal width
	contentMaxHeight: { type: Number, default: 0 }, // Min modal height
	contentMinHeight: { type: Number, default: 0 }, // Min modal height
	contentDark: { type: Boolean, default: false }, // Applies dark theme to card
	contentFlat: { type: Boolean, default: false }, // Applies a 'flat' design to card (no default shadow)
	enabledFullScreenBtn: { type: Boolean, default: true }, // Enables fullscreen btn in header
	enabledCollapseBtn: { type: Boolean, default: true }, // Enables collapse btn in header
	isAutoHeight: { type: Boolean, default: false }, // modal window auto height,
	contentHeight: { type: String, default: 'calc(100% - 32px)' }, // modal content height, if scroll needed
	contentStyle: { type: String, default: '' },
	canClose: { type: Boolean, default: true }
})

const modal = ref(null)
const dialogModel = ref(false)
const maximizedState = ref(props.maximized)
const minimizedState = ref(false)
const fromFullScreenToCollapsed = ref(false)

const customHeight = computed(() => props.contentHeight)
const modelValue = computed(() => props.modelValue)

watch(modelValue, value => {
	dialogModel.value = value
})

const hideModalHandler = () => {
	if (props.canClose) {
		modal.value.hide()
		return
	}
	emit('confirmClose')
}
const hideModalHandlerBackDropLayer = () => {
	if (props.canClose) return
	emit('confirmClose')
}
const onShow = () => {
	emit('onShow')
}
const onHide = () => {
	emit('onHide')
	minimizedState.value = false
}
const setMinimizeState = () => {
	minimizedState.value = true
	if (maximizedState.value) fromFullScreenToCollapsed.value = true
	else fromFullScreenToCollapsed.value = false
	maximizedState.value = false
}
const unsetMinimizeState = () => {
	minimizedState.value = false
}
const unsetFromFullScreenToCollapsed = () => {
	fromFullScreenToCollapsed.value = false
}
const setFullscreen = () => {
	maximizedState.value = true
	minimizedState.value = false
	fromFullScreenToCollapsed.value = false
}
const unsetFullscreen = () => {
	maximizedState.value = false
}
</script>

<style lang="sass" scoped>
.cursor-move
	cursor: default
.dialog-content
	height: calc(100% - 32px)
	overflow: auto
.dragSelector > *
	pointer-events: none
.overflow-hidden
	overflow: hidden
.text-overflow-ellipsis
	text-overflow: ellipsis
.dialog-navbar
	background-color: #bababa
	z-index: 9
	.q-bar
		background: transparent
.dialog-header-btn
	width: 32px
:deep(.q-dialog__inner)
	user-select: auto !important
</style>
