import { Auth } from '@/api/auth'
import { useAppStore } from '@/store/app'
import $snackBar from '@/services/snackBar'

export default async ({ from, to, next, redirect }) => {
	if (to.path === from.path) return next()

	const response = await Auth.auth()
	if (response?.data) {
		const appStore = useAppStore()
		await appStore.SET_USER(response.data)
		return next()
	}
	console.warn(response)
	$snackBar.warning('You are not authorized')
	return redirect('/login')
}
