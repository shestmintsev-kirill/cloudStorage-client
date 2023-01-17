import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
	state: () => ({
		currentUser: null,
		leftDrawerState: false,
		isAuth: false
	}),
	getters: {
		getCurrentUser: state => state.currentUser,
		getIsAuth: state => state.isAuth
	},
	actions: {
		SET_USER(payload) {
			if (payload) localStorage.cloudToken = payload?.token
			else localStorage.removeItem('cloudToken')
			this.currentUser = payload
			this.isAuth = !!payload
		},
		SET_DRAWER_STATE(payload) {
			this.leftDrawerState = payload
		}
	}
})
