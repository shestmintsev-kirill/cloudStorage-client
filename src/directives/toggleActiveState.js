let options = null
const onCtx = function () {
	;[...document.getElementsByClassName(options?.className)].forEach(elem => {
		elem.classList.remove(options?.toggleClassName)
	})
	setTimeout(() => {
		this.classList.add(options?.toggleClassName || '')
	}, 0)
}
const destroy = el => {
	options = null
	el.removeEventListener('contextmenu', onCtx)
}
const initEvent = el => {
	// @ts-ignore
	el.addEventListener('contextmenu', onCtx)
}
export default {
	name: 'toggleActiveState',
	/**
	 * @param {Object} binding
	 * @param {Object} binding.value
	 * @param {String} binding.value.className
	 * @param {String} binding.value.toggleClassName
	 * @param {Boolean} binding.value.targetHide
	 */
	beforeMount(el, binding) {
		const { className, toggleClassName, targetHide } = binding.value
		options = {
			el,
			className,
			toggleClassName,
			targetHide
		}
		initEvent(el)
	},
	/**
	 * @param {Object} binding
	 * @param {Object} binding.value
	 * @param {String} binding.value.className
	 * @param {String} binding.value.toggleClassName
	 * @param {Boolean} binding.value.targetHide
	 */
	updated(el, binding) {
		const { className, toggleClassName, targetHide } = binding.value
		options = {
			el,
			className,
			toggleClassName,
			targetHide
		}
		if (targetHide) {
			el.classList.remove(toggleClassName)
		}
	},
	unmounted(el) {
		destroy(el)
	}
}
