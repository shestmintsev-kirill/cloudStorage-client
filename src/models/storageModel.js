export default {
	columns: [
		{
			name: 'name',
			label: 'Name',
			align: 'left',
			field: row => row.name,
			sortable: true
		},
		{
			name: 'size',
			align: 'center',
			label: 'Size',
			field: 'size',
			sortable: true
		},
		{ name: 'date', align: 'center', label: 'Date', field: 'date', sortable: true }
	]
}
