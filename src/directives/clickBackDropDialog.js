/**
 * @param {Object} options
 * @param {Function} options.clickHandler
 * @param {String} options.selector
 */
let options = null
let backdropLayer = null
const backDropLayerClick = function () {
	if (typeof options?.clickHandler === 'function') {
		options.clickHandler()
	}
}
export default {
	beforeMount(el, binding) {
		options = binding?.value
		setTimeout(() => {
			backdropLayer = document.querySelector(options.selector)
			backdropLayer?.addEventListener('click', backDropLayerClick)
		}, 0)
	},
	updated(el, binding) {
		options = binding?.value
	}
}
