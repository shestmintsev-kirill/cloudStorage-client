<template>
	<q-menu touch-position context-menu auto-close>
		<q-list dense style="min-width: 100px">
			<template v-for="item in contextMenuElements" :key="item.key">
				<q-item
					v-if="item.condition(targetElement)"
					:disable="targetElement.isDownloading"
					clickable
					v-close-popup
					@click="item.handle(targetElement)"
				>
					<q-item-section>{{ item.name(targetElement) }}</q-item-section>
				</q-item>
				<q-separator v-if="item.condition(targetElement)" />
			</template>
		</q-list>
	</q-menu>
</template>

<script setup>
defineProps({
	/**
	 * require structure - {
		name: () => string,
		condition: node => boolean,
		handle: node => void
	}
	 */
	contextMenuElements: {
		type: Array,
		required: true,
		default: () => []
	},
	targetElement: {
		type: [Object, String],
		required: true
	}
})
</script>
