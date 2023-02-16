export default {
	/**
	 * Function to find element in deep array of objects
	 * @param arr deep array of objects
	 * @param search function that defines condition of search
	 * @param children_key name of deeps
	 * @returns found element
	 */
	findElementInDeepArray(arr = [], search, children_key = 'children') {
		if (typeof children_key !== 'string' || !Array.isArray(arr)) {
			throw new Error(
				'invalid type declaration for arguments in "findElementInDeepArray" method'
			)
		}
		let stack = [...arr]
		let result = null
		while (!result && stack.length > 0) {
			const node = stack.shift()
			if (search(node)) result = node

			if (node[children_key]?.length > 0 && Array.isArray(node[children_key])) {
				stack.push(...node[children_key])
			}
		}
		return result
	},

	formatSize(bytes) {
		if (!bytes) return ''
		if (bytes === 0) return '0 Bytes'
		let k = 1024
		let dm = 0
		let sizes = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'PB', 'EB', 'ZB', 'YB']
		let i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
	},

	isEqualObjects(firstObj, secondObj) {
		return (
			JSON.stringify(firstObj).split('').sort().join() ===
			JSON.stringify(secondObj).split('').sort().join()
		)
	}
}
