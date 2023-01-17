/**
 * @param {Object} options // directive available options
 * @param {Array} options.tableHeadersSettings // List of columns
 * @param {Function} options.onMouseUpHandle // Callback from component
 * @param {Boolean} options.isEnabled // enabled/disabled directive
 * @param {Number} options.firstColumnMinWidth // minimum width for the first column in the table
 * @param {Number} options.minColumnWidth // minimum width for the rest of columns in the table
 * @param {Number} options.lastColumnWidth // width for the last column in the table
 */
class ResizableTable {
	constructor(table, options) {
		this.table = table
		this.pageX = undefined
		this.curCol = undefined
		this.nxtCol = undefined
		this.curColWidth = undefined
		this.offsetWidth = undefined
		this.nxtColWidth = undefined
		this.divs = []
		this.options = options || {}
		;(this.tableHeadersSettings = [...this.options.tableHeadersSettings]), (this.rowsLength = 0)
		this.headerColumnsHasSeparatorClassName = 'column-divider' // Required
		this.clickedSeparatorIndex = null
		this.theadColumnsLength = 0
		this.columnMinWidth = this.options.minColumnWidth || 80 // min columns width
		this.firstColumnMinWidth = this.options.firstColumnMinWidth || 70 // min width for the first column
		this.lastColumnWidth = this.options.lastColumnWidth || 85 // min width for the first column
		this.init()
	}

	destroy() {
		this.removeListenersFromDocument()
		this.removeAllDivs()
		this.clearState()
		this.rowsLength = 0
		this.theadColumnsLength = 0
		this.options = {}
		this.clickedSeparatorIndex = null
	}

	clearState() {
		this.pageX = undefined
		this.curCol = undefined
		this.nxtCol = undefined
		this.curColWidth = undefined
		this.offsetWidth = undefined
		this.nxtColWidth = undefined
	}

	onMouseLeave(e) {
		if (e) {
			e.stopPropagation()
		}
	}

	onMouseDown(e) {
		e.stopPropagation()
		e.preventDefault()

		// Set col-resize nad pointer-event style for all columns to prevent glitches
		this.table.querySelector('thead').style.pointerEvents = 'none'

		// define (index) which separator was clicked on
		this.clickedSeparatorIndex = e.target.dataset.columnIndex

		this.curCol = e.target.parentElement
		this.nxtCol = this.curCol.nextElementSibling
		this.pageX = e.pageX

		const padding = this.paddingDiff(this.curCol)

		this.offsetWidth = this.curCol.offsetWidth
		this.curColWidth = this.offsetWidth - padding
		if (this.nxtCol) {
			this.nxtColWidth = this.nxtCol.offsetWidth - padding
		}
	}

	onMouseMove(e) {
		if (e) {
			e.stopPropagation()
		}

		if (this.curCol) {
			const diffX = e.pageX - this.pageX
			// Prevent resizing less than limit
			// @ts-ignore
			if (this.curColWidth + diffX >= this.columnMinWidth && this.curCol?.style?.width) {
				// @ts-ignore
				this.curCol.style.width = this.curColWidth + diffX + 'px' // Required width property
			}
		}
	}

	onMouseUp(e) {
		if (e) {
			e.stopPropagation()
		}

		this.clearState()

		// Return back previous cursor behavior and pointer-events properties
		this.table.querySelector('thead').style.pointerEvents = 'unset'

		const el = this.table.querySelector(
			`thead th div[data-column-index="${this.clickedSeparatorIndex}"]`
		)

		if (!el) {
			// Prevent actions below if element is not a column separator
			return
		}

		if (el?.parentElement?.clientWidth <= this.columnMinWidth) {
			el.parentElement.style.width = this.columnMinWidth + 1 + 'px'
		}

		const data = {
			uniqueId: +el.offsetParent.dataset?.uniqueId,
			width: el.offsetParent?.clientWidth + 'px'
		}

		if (typeof this.options?.onMouseUpHandle === 'function') {
			this.options.onMouseUpHandle(data) // "onMouseUpHandle" callback from options
		}
		this.clickedSeparatorIndex = null // Clearing index is required
	}

	onClick(e) {
		e.stopPropagation()
		e.preventDefault()
	}

	setListeners(div) {
		this.onMouseDown = this.onMouseDown.bind(this)
		this.onClick = this.onClick.bind(this)
		div.addEventListener('mousedown', this.onMouseDown)
		div.addEventListener('click', this.onClick)
	}

	setListenersToDocument() {
		this.onMouseMove = this.onMouseMove.bind(this)
		this.onMouseUp = this.onMouseUp.bind(this)
		this.onMouseLeave = this.onMouseLeave.bind(this)

		document.addEventListener('mousemove', this.onMouseMove)
		document.addEventListener('mouseup', this.onMouseUp)
		document.addEventListener('mouseleave', this.onMouseLeave)
	}

	removeListenersFromDocument() {
		document.removeEventListener('mousemove', this.onMouseMove)
		document.removeEventListener('mouseup', this.onMouseUp)
	}

	removeListener(div) {
		div.removeEventListener('mousedown', this.onMouseDown)
		div.removeEventListener('click', this.onClick)
	}

	removeListeners() {
		this.divs.forEach(div => this.removeListener(div))
	}

	setBaseStylesForColumn(column, styles = {}) {
		let columnStyles = {
			color: 'currentColor',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			...styles
		}
		for (let prop in columnStyles) {
			column.style[prop] = columnStyles[prop]
		}
	}

	initTheadColumn(column, index, uniqueId) {
		/**
		 * @param {Object} column
		 * @param {Number} index
		 * @param {String | undefined} uniqueId
		 *
		 */

		const columnIndex = index + 1
		const theadHeight = this.table.querySelector('thead').offsetHeight

		column.dataset.index = columnIndex.toString()

		if (column.classList.value.includes(this.headerColumnsHasSeparatorClassName)) {
			// Create divider for thead columns
			const div = this.createDiv(theadHeight)
			// Set index to identify column
			div.dataset.columnIndex = columnIndex.toString()
			this.divs.push(div)
			if (!column.querySelector('[data-column-index]')) {
				column.appendChild(div)
			}
			this.setListeners(div)
		}
	}

	createDiv(height) {
		const div = document.createElement('div')
		const divStyles = {
			top: '0',
			right: '0',
			width: '16px',
			position: 'absolute',
			borderRight: '1px solid #E0E0E0',
			opacity: '1',
			cursor: 'col-resize',
			userSelect: 'none',
			height: height + 'px',
			zIndex: 100
		}
		for (let prop in divStyles) {
			div.style[prop] = divStyles[prop]
		}
		return div
	}

	removeDiv(div) {
		if (div?.parentElement) {
			div.parentElement.removeChild(div)
		}
	}

	removeAllDivs() {
		this.divs.forEach(div => {
			this.removeListener(div)
			this.removeDiv(div)
		})
		// @ts-ignore
		if (this.div && typeof this.div.splice === 'function') {
			// @ts-ignore
			this.div.splice(0, this.divs.length)
		}
	}

	paddingDiff(col) {
		const style = window.getComputedStyle(col, null)

		if (style.getPropertyValue('box-sizing') === 'border-box') {
			return 0
		}

		const padLeft = style.getPropertyValue('padding-left')
		const padRight = style.getPropertyValue('padding-right')
		return parseInt(padLeft, 10) + parseInt(padRight, 10)
	}

	getStyleVal(el, css) {
		return window.getComputedStyle(el, null).getPropertyValue(css)
	}

	init() {
		if (!this.table) return

		this.table.style.minWidth = 'max-content'
		const rows = this.table.getElementsByTagName('tr')
		const cols = rows[0] ? rows[0].children : undefined
		this.rowsLength = rows.length
		if (!cols) return

		let rowIdx = 0

		for (let row = 0; row < this.rowsLength; ++row) {
			rowIdx++

			const cols = rows[row] ? rows[row].children : []

			for (let col = 0; col < cols.length; ++col) {
				if (row === 0) {
					// styles for thead columns
					this.setBaseStylesForColumn(cols[col], {
						position: 'sticky',
						top: 0,
						// backgroundColor: '#ffffff',
						zIndex: 1
					})

					this.theadColumnsLength = cols.length
					this.initTheadColumn(cols[col], col, cols[col].dataset.uniqueId)
				}
			}
		}
		this.setListenersToDocument()
	}
}

function getComponentRefs(el) {
	const ctx = el.__tableResizable
	const tables = el.getElementsByTagName('table')
	return {
		ctx,
		tables
	}
}

function handleUpdate(el, options) {
	/**
	 * @param {Object} el
	 * @param {Object} options
	 */

	const { ctx, tables } = getComponentRefs(el)

	if (tables === undefined && ctx !== undefined) {
		// table turned into a grid?
		ctx.destroy()
		delete el.__tableResizable
	} else if (tables !== undefined && ctx === undefined) {
		// new table
		setTimeout(() => {
			el.__tableResizable = new ResizableTable(tables[0], options)
		}, 0)
	} else if (tables !== undefined && ctx !== undefined) {
		// use-case is columns added/removed
		// tear down old one and add new one
		ctx.destroy()
		delete el.__tableResizable
		setTimeout(() => {
			el.__tableResizable = new ResizableTable(tables[0], options)
		}, 0)
	}
}

export default {
	name: 'TableResizableColumns',
	beforeMount(el, binding) {
		if (!binding.value.isEnabled) {
			console.info(
				'To enabled v-table-resizable-columns directive, isEnabled option should be "true"'
			)
			return
		}
		handleUpdate(el, binding.value)
	},
	// @ts-ignore
	updated(el, binding) {
		const { ctx, tables } = getComponentRefs(el)

		if (ctx && tables[0]) {
			const currentRowsLength = tables[0].getElementsByTagName('tr').length // Current rows length in the table
			const [...elements] = tables[0].querySelectorAll(
				`thead th.${ctx.headerColumnsHasSeparatorClassName}`
			) // Collection of elements with required class
			const hasNoDividers = elements.some(el => !el.querySelector('div[data-column-index]')) // Checking for nonexistent dividers

			if (
				hasNoDividers || // check if header column has no divider
				currentRowsLength !== ctx.rowsLength || // check for table rows amount
				JSON.stringify(ctx.options) !== JSON.stringify(binding.value) // Watching for directive options changing
			) {
				handleUpdate(el, binding.value)
			}
		}
	},
	unmounted(el) {
		const { ctx } = getComponentRefs(el)
		if (ctx) {
			ctx.destroy()
			delete el.__tableResizable
		}
	},
	beforeUnmount(el) {
		const { ctx } = getComponentRefs(el)
		if (ctx) {
			ctx.destroy()
			delete el.__tableResizable
		}
	}
}
