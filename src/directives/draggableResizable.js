let ACTIVE_DATA_MODAL_ID = null
function DirectiveOptions(opt) {
	/**
	 * @param {object} opt
	 * @param {number} opt.resizing
	 * @param {number} opt.defaultWidth
	 * @param {number} opt.defaultHeight
	 * @param {number} opt.modalMaxWidth
	 * @param {number} opt.modalMinWidth
	 * @param {boolean} opt.isCollapsed
	 * @param {boolean} opt.isResizable
	 * @param {boolean} opt.isDraggable
	 * @param {boolean} opt.fromFullScreenToCollapsed
	 * @param {boolean} opt.isFullScreen
	 * @param {string} opt.draggableSelector // selector
	 * @param {string} opt.dialogSelector // selector
	 * @param {string} opt.id
	 * @param {object} opt.methods
	 * @param {object} opt.isAutoHeight
	 */

	// directive options
	const types = {
		'resizing': 'string', // can be (floating, fixed)
		'defaultWidth': 'number',
		'defaultHeight': 'number',
		'modalMaxHeight': 'number',
		'modalMinHeight': 'number',
		'modalMaxWidth': 'number',
		'modalMinWidth': 'number',
		'isFullScreen': 'boolean',
		'isCollapsed': 'boolean',
		'isResizable': 'boolean',
		'isDraggable': 'boolean',
		'fromFullScreenToCollapsed': 'boolean',
		'draggableSelector': 'string', // Should be inside of parent element
		'dialogSelector': 'string',
		'id': 'string', // required not empty string
		'methods': 'object',
		'isAutoHeight': 'boolean'
	}

	const required = ['id']

	if (opt === null || Array.isArray(opt) || typeof opt !== 'object') {
		throw new Error(`Invalid type declaration for ${opt} property!`)
	}

	// checking for required properties
	required.forEach(prop => {
		if (!opt.hasOwnProperty(prop)) {
			throw new Error(`${prop} is required option!`)
		}
	})

	for (let type in opt) {
		if (typeof opt[type] === types[type]) {
			if (typeof opt[type] === 'string' && type === 'id' && !!!opt[type].length) {
				throw new Error(`${type} can't be empty!`)
			}
			this[type] = opt[type]
		} else {
			throw new Error(
				`Invalid type declaration for "${type}" property! It should be ${
					types[type]
				} instead of ${typeof opt[type]}!`
			)
		}
	}
}

function ResizableUnit(el, options = {}) {
	let OPTIONS = new DirectiveOptions(options)
	let MODAL = el // modal window
	// @ts-ignore
	let nodeDrag = !!!OPTIONS.draggableSelector
		? null
		: MODAL.querySelector(OPTIONS.draggableSelector)
	let MIN_MODAL_HEIGHT_COLLAPSED = nodeDrag?.offsetHeight || 0
	let MODAL_ACTION_BUTTONS = MODAL.querySelector('.q-card__actions')
	// @ts-ignore
	let MODAL_ACTION_BUTTONS_HEIGHT = MODAL_ACTION_BUTTONS?.offsetHeight || 0
	// @ts-ignore
	let wDef = OPTIONS.defaultWidth || MODAL.offsetWidth // default value "width"

	this.MAX_MODAL_HEIGHT =
		// @ts-ignore
		!!!OPTIONS?.modalMaxHeight ||
		// @ts-ignore
		OPTIONS?.modalMaxHeight <= 0
			? window.innerHeight
			: OPTIONS.modalMaxHeight

	this.MIN_MODAL_HEIGHT =
		// @ts-ignore
		!!!OPTIONS?.modalMinHeight ||
		// @ts-ignore
		OPTIONS?.modalMinHeight <= 0
			? 1
			: OPTIONS.modalMinHeight

	this.PREV_MIN_MODAL_HEIGHT = this.MIN_MODAL_HEIGHT

	this.MAX_MODAL_WIDTH =
		// @ts-ignore
		!!!OPTIONS.modalMaxWidth ||
		// @ts-ignore
		OPTIONS.modalMaxWidth <= 0
			? window.innerWidth
			: OPTIONS.modalMaxWidth
	// @ts-ignore
	this.DIALOGS = OPTIONS.dialogSelector || '.q-dialog'
	// @ts-ignore
	this.RESIZING = OPTIONS.resizing || 'floating'
	this.DEFAULT_WIDTH =
		this.MAX_MODAL_WIDTH < wDef && this.MAX_MODAL_WIDTH > 0 ? this.MAX_MODAL_WIDTH : wDef
	this.DEFAULT_HEIGHT = 0
	// @ts-ignore
	this.MIN_MODAL_WIDTH = OPTIONS?.modalMinWidth || 1 // default (150px)
	let Z_INDEX = 6000
	let EVENT_X = null // event position horizontal
	let EVENT_Y = null // event position vertical
	let MODAL_START_WIDTH = null
	let MODAL_START_HEIGHT = null
	let PROP_MODAL_LEFT = null
	let PROP_MODAL_TOP = null
	let PREV_MODAL_STATE = null
	let IS_MODAL_IN_MOVING = false
	let ENABLE_FULL_SCREEN_ON_REACH_TOP = false
	let FIRST_MODAL_CLIENT_RECT = null
	let ICON_RESIZE = `
		<svg xmlns="http://www.w3.org/2000/svg"
		style="pointer-events: none; transform: scale(.8)"
		width="100%"
		height="100%"
		viewBox="0 0 15.431 15.801">
			<g id="icon-resize" transform="translate(-5.274 -2.061)">
				<line x2="20" transform="matrix(0.695, -0.719, 0.719, 0.695, 5.981, 17.155)" fill="none" stroke="#707070" stroke-linecap="round" stroke-width="1"/><line x2="10" transform="matrix(0.695, -0.719, 0.719, 0.695, 13.051, 17.031)" fill="none" stroke="#707070" stroke-linecap="round" stroke-width="1"/>
			</g>
		</svg>
	`
	let doc = document
	let OVERLAY_TIME_ANIMATION = 300
	let OVERLAY_ID = 'overlay-blurred'
	// @ts-ignore
	if (!!!OPTIONS.draggableSelector && OPTIONS.isDraggable) {
		console.info(
			'There is no chosen selector for dragging! Set please element which will be used as draggable selector!'
		)
	}
	let CURRENT_CONTROLLER = undefined // Selected controller can be ('right', 'bottom', 'bottom-right')

	let controllers = [
		{
			name: 'right',
			props: {
				position: 'absolute',
				width: '3px',
				height: '100%',
				top: '0',
				right: '0',
				cursor: 'e-resize',
				zIndex: 10
			}
		},
		{
			name: 'bottom',
			props: {
				position: 'absolute',
				width: '100%',
				height: '3px',
				bottom: '0',
				right: '0',
				cursor: 's-resize',
				zIndex: 10
			}
		},
		{
			name: 'bottom-right',
			props: {
				position: 'absolute',
				width: '15px',
				height: '15px',
				bottom: '0',
				right: '0',
				cursor: 'nw-resize',
				zIndex: 10
			}
		}
	]

	this.setOptions = function (opt) {
		OPTIONS = opt
	}

	this.setFullScreenMode = function () {
		MODAL.style.width = window.innerWidth + 'px'
		MODAL.style.maxWidth = '100vw'
		MODAL.style.maxHeight = '100vh'
		MODAL.style.height = window.innerHeight + 'px'
		MODAL.style.top = '0'
		MODAL.style.left = '0'
		this.toggleResizeControllers(false)
	}

	this.toggleResizeControllers = function (flag = true) {
		/**
		 * enabling/disabling modal resize functionality
		 */
		;[...MODAL.querySelectorAll('[data-controller]')].forEach(el => {
			el.style.visibility = flag ? 'visible' : 'hidden'
		})
	}

	this.toggleCollapsedMode = function (flag = true) {
		/**
		 * *Collapsing modal window to the left bottom corner
		 */
		if (flag) {
			// Save positions of the modal window
			let { left, top, width, height } = window.getComputedStyle(MODAL)
			PREV_MODAL_STATE = { left, top, width, height }
			// @ts-ignore
			MODAL.style.minHeight = nodeDrag?.offsetHeight + 'px' || this.DEFAULT_HEIGHT
			// @ts-ignore
			MODAL.style.height = nodeDrag?.offsetHeight + 'px' || this.DEFAULT_HEIGHT
			// @ts-ignore
			if (!nodeDrag?.offsetHeight && !OPTIONS.isDraggable) {
				console.info(
					'Draggable option is disabled, define please draggableSelector to set height when modal is collapsed!'
				)
			}
			// land modal window to the left corner of viewport
			MODAL.style.left = (MODAL.offsetWidth - window.innerWidth) / 2 + 'px'
			MODAL.style.top = (window.innerHeight - MODAL.offsetHeight) / 2 + 'px'
			return
		}
		// @ts-ignore
		if (
			OPTIONS.fromFullScreenToCollapsed &&
			typeof OPTIONS?.methods?.setFullscreen === 'function'
		) {
			// Case when user are going to open modal window from collapsed state and it was in fullscreen mode before
			// @ts-ignore
			OPTIONS.methods.setFullscreen()
			return
		}
		// @ts-ignore
		if (!!PREV_MODAL_STATE && !OPTIONS.isFullScreen) {
			let { left, top, width, height } = PREV_MODAL_STATE
			MODAL.style.left = left
			MODAL.style.top = top
			MODAL.style.width = width
			MODAL.style.height = height
			PREV_MODAL_STATE = null
		}
	}

	this.getPrevModalState = function () {
		return PREV_MODAL_STATE
	}

	this.getOptions = function () {
		return OPTIONS
	}

	this.getModal = function () {
		return MODAL
	}

	this.getDefaultModalHeight = function () {
		return this.DEFAULT_HEIGHT
	}

	this.destroy = function () {
		removeAllListeners()
		if (!!MODAL) {
			;[...MODAL.querySelectorAll('[data-controller]')].forEach(el => el.remove())
		}
		EVENT_X = null
		EVENT_Y = null
		MODAL = null
		MODAL_START_WIDTH = null
		MODAL_START_HEIGHT = null
		PROP_MODAL_LEFT = null
		PROP_MODAL_TOP = null
		PREV_MODAL_STATE = null
		ENABLE_FULL_SCREEN_ON_REACH_TOP = false
		FIRST_MODAL_CLIENT_RECT = null
		ICON_RESIZE = ''
		OPTIONS = {}
		CURRENT_CONTROLLER = null
		controllers = []
		wDef = 0
		OVERLAY_TIME_ANIMATION = 0
		OVERLAY_ID = ''
		// @ts-ignore
		doc = null
		nodeDrag = null
		MIN_MODAL_HEIGHT_COLLAPSED = 0
		Z_INDEX = 0
		MODAL_ACTION_BUTTONS = null
		MODAL_ACTION_BUTTONS_HEIGHT = 0
		this.DEFAULT_WIDTH = 0
		this.DEFAULT_HEIGHT = 0
		this.MIN_MODAL_WIDTH = 0
		this.MAX_MODAL_WIDTH = 0
		this.MAX_MODAL_HEIGHT = 0
		this.MIN_MODAL_HEIGHT = 0
		this.PREV_MIN_MODAL_HEIGHT = 0
		this.DIALOGS = ''
		this.RESIZING = ''
	}

	function createBlurredOverlay() {
		const newOverlay = document.createElement('div')
		newOverlay.setAttribute(
			'style',
			`
			position: fixed;
			background: rgba(222, 222, 222, .3);
			backdrop-filter: blur(2px);
			top: 10px;
			left: 10px;
			right: 10px;
			bottom: 10px;
			border-radius: 6px;
			transition: all ${OVERLAY_TIME_ANIMATION}ms ease;
			transform: scale(.95);
			opacity: 0;
			z-index: ${Z_INDEX}
		`
		)
		newOverlay.id = OVERLAY_ID
		doc.body.appendChild(newOverlay)
		setTimeout(() => {
			newOverlay.style.opacity = '1'
			newOverlay.style.transform = 'scale(1)'
		}, OVERLAY_TIME_ANIMATION / 3)
	}

	function removeBlurredOverlay(overlay) {
		/**
		 * @param {Object} overlay
		 */
		// @ts-ignore
		overlay.style.transform = 'scale(.99)'
		// @ts-ignore
		overlay.style.opacity = '0'
		setTimeout(() => {
			overlay.remove()
		}, OVERLAY_TIME_ANIMATION)
	}

	function toggleNotActiveControllers(flag = true) {
		/**
		 * *Showing/hiding modal window resize controllers
		 */
		// @ts-ignore
		document.body.style.cursor = flag
			? controllers.find(el => el.name === CURRENT_CONTROLLER)?.props?.cursor
			: 'default'
		if (!!MODAL) {
			;[...MODAL.querySelectorAll('[data-controller]')].forEach(el => {
				if (el.dataset.controller !== CURRENT_CONTROLLER) {
					el.style.pointerEvents = flag ? 'none' : 'unset'
				}
			})
		}
	}

	function addListenersToBody() {
		doc.addEventListener('mousedown', onMouseDownBody)
		doc.addEventListener('mouseup', onMouseUpBody)
	}

	function removeAllListeners() {
		if (nodeDrag) {
			nodeDrag.removeEventListener('mousedown', onMouseDownNodeDrag)
			nodeDrag.removeEventListener('mouseup', onMouseUpNodeDrag)
		}
		MODAL.removeEventListener('mousedown', onMouseDownModal)
		doc.removeEventListener('mousedown', onMouseDownBody)
		doc.removeEventListener('mousemove', onMouseMoveBody)
		doc.removeEventListener('mouseup', onMouseUpBody)
		doc.removeEventListener('mousemove', onDragBody)
	}

	const onMouseDownModal = () => {
		/**
		 * * Overlapping rest of modal windows
		 */
		;[...document.querySelectorAll(this.DIALOGS)].forEach(el => {
			// @ts-ignore
			if (el.id === OPTIONS.id) {
				// @ts-ignore
				el.style.zIndex = Z_INDEX + 1
			} else {
				// @ts-ignore
				el.style.zIndex = Z_INDEX
			}
		})
	}

	function getClearedStyleProp(el, prop) {
		/**
		 * @param {Object} el
		 * @param {String} prop
		 * @return {Number}
		 */
		// Getting style property of html element
		return parseFloat(window.getComputedStyle(el)[prop])
	}

	function onDragBody(e) {
		// Moving the modal window around the screen
		IS_MODAL_IN_MOVING = true
		let originalStyles = window.getComputedStyle(MODAL)
		MODAL.style.left = parseFloat(originalStyles.left) + e.movementX + 'px'
		MODAL.style.top = parseFloat(originalStyles.top) + e.movementY + 'px'
		let { top, bottom, left, right, height, width } = MODAL.getBoundingClientRect()
		const overlay = document.querySelector('#' + OVERLAY_ID)
		if (top <= -10) {
			if (!overlay) createBlurredOverlay()
			ENABLE_FULL_SCREEN_ON_REACH_TOP = true
			// prevent moving more than -10 pixels
			MODAL.style.top = (height - window.innerHeight) / 2 - 10 + 'px'
		} else {
			if (overlay) removeBlurredOverlay(overlay)
			ENABLE_FULL_SCREEN_ON_REACH_TOP = false
		}
		// bottom border
		if (bottom >= window.innerHeight) {
			MODAL.style.top = (window.innerHeight - height) / 2 + 'px'
		}
		// left border
		if (left <= 0) {
			MODAL.style.left = (width - window.innerWidth) / 2 + 'px'
		}
		// right border
		if (right >= window.innerWidth) {
			MODAL.style.left = (window.innerWidth - width) / 2 + 'px'
		}
	}

	const onMouseMoveBody = e => {
		// @ts-ignore
		if (ACTIVE_DATA_MODAL_ID !== OPTIONS?.id) return // Prevent multiple resizing
		const diffWidth = EVENT_X - e.pageX
		const diffHeight = EVENT_Y - e.pageY
		const leftOffset = (e.pageX - EVENT_X) / 2 // required value for correct calculation left position of modal window
		const topOffset = (e.pageY - EVENT_Y) / 2 // required value for correct calculation top position of modal window
		const modalWidth = MODAL_START_WIDTH - diffWidth
		const modalHeight = MODAL_START_HEIGHT - diffHeight

		// Prevent the modal window from enlarging beyond the viewport
		const canChangeWidth =
			modalWidth >= this.MIN_MODAL_WIDTH &&
			// @ts-ignore
			modalWidth <= this.MAX_MODAL_WIDTH &&
			modalWidth + FIRST_MODAL_CLIENT_RECT.x < window.innerWidth

		const canChangeHeight =
			modalHeight >= this.MIN_MODAL_HEIGHT &&
			modalHeight <= this.MAX_MODAL_HEIGHT &&
			modalHeight >= MIN_MODAL_HEIGHT_COLLAPSED &&
			// @ts-ignore
			!OPTIONS.isCollapsed &&
			modalHeight + FIRST_MODAL_CLIENT_RECT.y < window.innerHeight

		const fullOffsetTop = MODAL.offsetTop + MIN_MODAL_HEIGHT_COLLAPSED
		// @ts-ignore
		if (OPTIONS.isResizable) {
			// Case when user move modal window in collapsed state and can resize it
			// @ts-ignore
			if (fullOffsetTop !== window.innerHeight && OPTIONS.isCollapsed) {
				PREV_MODAL_STATE.height = MIN_MODAL_HEIGHT_COLLAPSED + 'px'
				// @ts-ignore
				if (typeof OPTIONS?.methods?.unsetMinimizeState === 'function') {
					// @ts-ignore
					OPTIONS.methods.unsetMinimizeState()
				} else {
					throw new Error(
						'Define unsetMinimizeState function inside component level methods!'
					)
				}
			}
			// @ts-ignore
			if (MODAL.offsetHeight >= this.PREV_MIN_MODAL_HEIGHT && !OPTIONS.isCollapsed) {
				this.MIN_MODAL_HEIGHT = this.PREV_MIN_MODAL_HEIGHT
				MODAL.style.minHeight = this.MIN_MODAL_HEIGHT + 'px'
			}
		}

		if (canChangeWidth) {
			if (CURRENT_CONTROLLER === 'right' || CURRENT_CONTROLLER === 'bottom-right') {
				// Changing width of modal window to the direction right
				MODAL.style.width = MODAL_START_WIDTH - diffWidth + 'px'
				if (this.RESIZING === 'floating') {
					MODAL.style.left = leftOffset + PROP_MODAL_LEFT + 'px'
				}
			}
		}

		if (canChangeHeight) {
			if (CURRENT_CONTROLLER === 'bottom' || CURRENT_CONTROLLER === 'bottom-right') {
				// Changing height of modal window to the direction bottom
				MODAL.style.height = MODAL_START_HEIGHT - diffHeight + 'px'
				if (this.RESIZING === 'floating') {
					MODAL.style.top = topOffset + PROP_MODAL_TOP + 'px'
				}
			}
		}
	}

	const onMouseUpBody = () => {
		const embedElement = document.querySelector(
			`${OPTIONS.dialogSelector || '.q-dialog'} embed`
		)
		if (embedElement) {
			embedElement.style.pointerEvents = 'inherit'
		}
		CURRENT_CONTROLLER = null
		// @ts-ignore
		if (!OPTIONS.isFullScreen) {
			let { left, top, width, height } = window.getComputedStyle(MODAL)

			if (MODAL.offsetTop < 0) {
				top = parseFloat(top) - MODAL.offsetTop + 'px'
				MODAL.style.top = top
			}

			// @ts-ignore
			if (!OPTIONS.isCollapsed || (OPTIONS.isCollapsed && ENABLE_FULL_SCREEN_ON_REACH_TOP)) {
				// set default height if modal window height equal to minimal height
				if (parseFloat(height) === MIN_MODAL_HEIGHT_COLLAPSED) {
					height = this.DEFAULT_HEIGHT + 'px' || 'auto'
				}
				PREV_MODAL_STATE = { left, top, width, height }
			}
		}
		// @ts-ignore
		if (OPTIONS.isCollapsed && !!PREV_MODAL_STATE) {
			// Changing only width in collapsed state
			PREV_MODAL_STATE.width = window.getComputedStyle(MODAL).width
		}
		if (ENABLE_FULL_SCREEN_ON_REACH_TOP) {
			// @ts-ignore
			if (typeof OPTIONS?.methods?.setFullscreen === 'function') {
				// @ts-ignore
				OPTIONS.methods.setFullscreen()
			} else {
				throw new Error('Define setFullscreen function inside component level methods!')
			}
			ENABLE_FULL_SCREEN_ON_REACH_TOP = false
		}

		if (IS_MODAL_IN_MOVING) {
			onMouseUpNodeDrag()
		}

		const overlay = document.querySelector('#' + OVERLAY_ID)
		if (overlay) overlay.remove()

		toggleNotActiveControllers(false)
	}

	function onMouseDownBody(e) {
		const embedElement = document.querySelector(
			`${OPTIONS.dialogSelector || '.q-dialog'} embed`
		)
		if (embedElement) {
			embedElement.style.pointerEvents = 'none'
		}
		EVENT_X = e.pageX
		EVENT_Y = e.pageY
		MODAL_START_WIDTH = MODAL.offsetWidth
		MODAL_START_HEIGHT = MODAL.offsetHeight
		FIRST_MODAL_CLIENT_RECT = MODAL.getBoundingClientRect()
		MODAL.style.height = MODAL_START_HEIGHT + 'px'
		MODAL.style.width = MODAL_START_WIDTH + 'px'
		PROP_MODAL_LEFT = getClearedStyleProp(MODAL, 'left') // style property left of modal window type {Number}
		PROP_MODAL_TOP = getClearedStyleProp(MODAL, 'top') // style property left of modal window type {Number}
		CURRENT_CONTROLLER = e.target.dataset.controller

		if (!!CURRENT_CONTROLLER) {
			toggleNotActiveControllers()
		}

		ACTIVE_DATA_MODAL_ID = e.target.dataset.id // Set global active modal id
	}

	function onMouseDownNodeDrag() {
		if (nodeDrag) {
			nodeDrag.style.cursor = 'grabbing'
		}
		// @ts-ignore
		doc.querySelector('body').style.cursor = 'grabbing'
		doc.addEventListener('mousemove', onDragBody)
	}

	const onMouseUpNodeDrag = () => {
		IS_MODAL_IN_MOVING = false

		if (!!PREV_MODAL_STATE) {
			/**
			 *  Save left and top positions to the previous state after
			 *  modal window will be moved with dragging
			 */
			const { left, top } = window.getComputedStyle(MODAL)
			const fullOffsetTop = MODAL.offsetTop + MIN_MODAL_HEIGHT_COLLAPSED
			// @ts-ignore
			if (fullOffsetTop !== window.innerHeight) {
				// @ts-ignore
				if (OPTIONS.isCollapsed && OPTIONS.isResizable) {
					// Case when user move modal window in collapsed state and can resize it
					this.MIN_MODAL_HEIGHT = MIN_MODAL_HEIGHT_COLLAPSED
				}

				// @ts-ignore
				if (OPTIONS.fromFullScreenToCollapsed) {
					// Reset "fromFullScreenToCollapsed" option in parent component to prevent wrong behavior
					// @ts-ignore
					if (typeof OPTIONS?.methods?.unsetFromFullScreenToCollapsed === 'function') {
						// @ts-ignore
						OPTIONS.methods.unsetFromFullScreenToCollapsed()
					}
				}
			}

			PREV_MODAL_STATE.left = left
			PREV_MODAL_STATE.top = top
		}

		if (nodeDrag) {
			nodeDrag.style.cursor = 'grab'
		}
		doc.removeEventListener('mousemove', onDragBody)
	}

	const initDraggable = () => {
		if (nodeDrag) {
			nodeDrag.style.cursor = 'grab'
			nodeDrag.addEventListener('mousedown', onMouseDownNodeDrag)
			nodeDrag.addEventListener('mouseup', onMouseUpNodeDrag)
		}
	}

	const initResizable = () => {
		// Draw controllers
		for (let cnt of controllers) {
			const controller = document.createElement('div')
			controller.dataset.controller = cnt.name
			if (cnt.name === 'bottom-right') {
				// Adding icon to the right bottom corner
				controller.innerHTML = ICON_RESIZE
			}
			for (let prop in cnt.props) {
				controller.style[prop] = cnt.props[prop]
				controller.classList.add('resize-controller', cnt.name)
				// @ts-ignore
				controller.dataset.id = OPTIONS.id // special attribute to associate with parent element id
			}
			MODAL.appendChild(controller)
		}

		doc.addEventListener('mousemove', onMouseMoveBody)
	}

	this.setModalToCenter = function () {
		MODAL.style.width = this.DEFAULT_WIDTH + 'px'
		MODAL.style.height = this.DEFAULT_HEIGHT + 'px' || 'auto'
		MODAL.style.left = '0'
		MODAL.style.top = '0'
	}

	this.init = function () {
		// Reset styles
		MODAL.offsetParent.style.padding = '0' // required
		MODAL.offsetParent.style.userSelect = 'none' // required
		MODAL.style.left = window.getComputedStyle(MODAL)['left'] // required
		MODAL.style.top = window.getComputedStyle(MODAL)['top'] // required
		MODAL.style.position = 'relative'
		// @ts-ignore
		MODAL.style.maxHeight = this.MAX_MODAL_HEIGHT + 'px' // required
		// @ts-ignore
		MODAL.style.minHeight = this.MIN_MODAL_HEIGHT + 'px' // required
		// @ts-ignore
		MODAL.style.maxWidth = this.MAX_MODAL_WIDTH + 'px' // required
		// @ts-ignore
		MODAL.style.minWidth = this.MIN_MODAL_WIDTH + 'px' // required
		MODAL.style.overflow = 'hidden' // required
		// @ts-ignore
		MODAL.style.width = this.DEFAULT_WIDTH + 'px' // required
		if (!!MODAL_ACTION_BUTTONS_HEIGHT) {
			// Redefine "MODAL_ACTION_BUTTONS_HEIGHT" because of changing modal window width
			MODAL_ACTION_BUTTONS_HEIGHT = MODAL_ACTION_BUTTONS?.offsetHeight
			// @ts-ignore
			if (!!OPTIONS?.modalMinHeight) {
				// @ts-ignore
				this.DEFAULT_HEIGHT = OPTIONS.modalMinHeight
			} else {
				// Added buttons action block height to the modal window
				this.DEFAULT_HEIGHT = MODAL.offsetHeight + MODAL_ACTION_BUTTONS_HEIGHT
			}
		} else {
			this.DEFAULT_HEIGHT = MODAL.offsetHeight
		}
		MODAL.style.height = `${
			OPTIONS.defaultHeight ? OPTIONS.defaultHeight : this.DEFAULT_HEIGHT
		}px` // required
		// @ts-ignore
		if (OPTIONS.isAutoHeight) {
			MODAL.style.height = 'auto' // required
		}
		MODAL.addEventListener('mousedown', onMouseDownModal)

		if (nodeDrag) {
			nodeDrag.style.overflow = 'hidden'
			nodeDrag.style.whiteSpace = 'nowrap'
		}
		// @ts-ignore
		if (!!document.querySelector('#' + OPTIONS.id)) {
			// @ts-ignore
			document.querySelector('#' + OPTIONS.id).style.zIndex = Z_INDEX + 1
		}
		// @ts-ignore
		OPTIONS.isResizable ? initResizable() : false
		// @ts-ignore
		OPTIONS.isDraggable ? initDraggable() : false

		// Add events to the body element
		addListenersToBody()

		// @ts-ignore
		if (OPTIONS.isFullScreen) this.setFullScreenMode()
	}
}

function handleUpdate(ctx, newData, el) {
	/**
	 * @param {Object} ctx
	 * @param {Object} newData
	 * @param {Object} el
	 */

	const prevState = ctx.getPrevModalState()
	const prevOptions = ctx.getOptions()
	const modal = ctx.getModal()

	/**
	 *  ! Setting new options to the instance of "ResizableUnit"
	 *  * Needed for correct working collapsed and fullscreen mode
	 */
	ctx.setOptions(newData)

	// Watching for isFullScreen options
	if (prevOptions.isFullScreen !== newData.isFullScreen) {
		if (newData.isFullScreen) {
			// Set Fullscreen mode to the modal window
			ctx.setFullScreenMode()
		} else {
			ctx.toggleResizeControllers()

			if (!!prevState) {
				// Set previous state to the modal window after turning off fullscreen mode
				for (let prop in prevState) {
					el.style[prop] = prevState[prop]
				}
				const modalOffset = modal.offsetTop
				// Checking for negative modal top position
				if (modalOffset < 0) {
					let { top } = window.getComputedStyle(modal)
					modal.style.top = parseFloat(top) + Math.abs(modalOffset) + 'px'
				}
			} else {
				// Set default modal window sizes if no previous state and if modal window equal viewport sizes

				let { offsetHeight, offsetWidth } = el
				let { innerHeight, innerWidth } = window

				if (offsetHeight == innerHeight && offsetWidth == innerWidth) {
					ctx.setModalToCenter()
				}
			}
		}
	}

	// Watching for isCollapsed option
	if (prevOptions.isCollapsed !== newData.isCollapsed) {
		ctx.toggleCollapsedMode(newData.isCollapsed)
	}
}

function getComponent(el) {
	const ctx = el.__resizableUnit
	return {
		ctx
	}
}

export default {
	name: 'resizableUnit',
	beforeMount(el, binding) {
		const DELAY_TO_INIT = 0
		const { ctx } = getComponent(el)
		if (!!ctx) return
		setTimeout(() => {
			Object.defineProperty(el, '__resizableUnit', {
				value: new ResizableUnit(el, binding.value),
				configurable: true
			})
			el.__resizableUnit.init()
		}, DELAY_TO_INIT)
	},
	updated(el, binding) {
		const { ctx } = getComponent(el)
		if (ctx === undefined) return

		if (binding.value) {
			handleUpdate(ctx, binding.value, el)
		}
	},
	unmounted(el) {
		const { ctx } = getComponent(el)
		ACTIVE_DATA_MODAL_ID = null
		if (ctx === undefined) return
		ctx.destroy()
		delete el.__resizableUnit
	}
}
