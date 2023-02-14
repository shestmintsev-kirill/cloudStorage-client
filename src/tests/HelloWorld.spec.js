import { describe, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import HelloWorld from '@/components/ContextMenu/ContextMenu.vue'

describe('HelloWorld', () => {
	test('renders properly', () => {
		const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
		expect(wrapper.text()).toContain('')
	})
})
