const storageName = 'user-storage'

// Store user info in localStorage
export const UserStorage = {
	create: (user) => {
		let storage = getUserStorageData()
		if (!storage || user !== Object.keys(storage)[0]) {
			let obj = {}
			obj[user] = { 'user-name': user }
			localStorage.setItem(storageName, JSON.stringify(obj))
		} else {
			UserStorage.setItem('user-name', user)
		}
	},
	getItem: (key) => {
		let value = null
		const storage = getUserStorageData()
		if (storage) {
			const userName = Object.keys(storage)[0]
			if (userName && storage[userName] && storage[userName][key]) {
				value = storage[userName][key]
			}
		}
		return value
	},
	setItem: (key, value) => {
		let storage = getUserStorageData()
		if (storage) {
			const userName = Object.keys(storage)[0]
			if (userName && storage[userName] && storage[userName]) {
				storage[userName][key] = value
			}
		}
		localStorage.setItem(storageName, JSON.stringify(storage))
	},
	removeItem: (key) => {
		const storage = getUserStorageData()
		if (storage) {
			const userName = Object.keys(storage)[0]
			delete storage[userName][key]
			localStorage.setItem(storageName, JSON.stringify(storage))
		}
	},
	removeAll: () => {
		localStorage.removeItem(storageName)
	}
}

export function getUserStorageData () {
	const storageStr = localStorage.getItem(storageName)
	let data = null
	if (storageStr && storageStr !== 'null' && storageStr.length > 0) {
		let userStorage = JSON.parse(storageStr)
		let userName = Object.keys(userStorage)[0]
		if (typeof userStorage === 'object' && userName) {
			data = userStorage
		}
	}
	return data
}