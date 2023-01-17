import { ref } from 'vue'

export default function (emit) {
	const mdVal = ref(false)

	const show = () => {
		mdVal.value = true
	}

	const hide = () => {
		mdVal.value = false
	}

	const onDialogHide = () => {
		emit('hide')
	}

	return {
		show,
		hide,
		onDialogHide,
		mdVal
	}
}
