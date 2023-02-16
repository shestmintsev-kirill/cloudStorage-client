<template>
	<q-circular-progress
		indeterminate
		size="50px"
		:thickness="0.25"
		rounded
		color="blue-6"
		class="q-ma-md loader"
	/>
</template>

<style lang="scss" scoped>
.loader {
	position: absolute !important;
	top: -16px;
	right: -8px;
}
</style>
