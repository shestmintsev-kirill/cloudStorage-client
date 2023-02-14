import { Auth } from '@/api/auth'
import { useAppStore } from '@/store/app'
import $snackBar from '@/services/snackBar'
import { UserStorage } from '@/services/userStorage'

export default async ({ next, redirect }) => {
	const response = await Auth.auth()
	if (response?.data) {
		const { id, email } = response.data
		const appStore = useAppStore()
		appStore.SET_USER(response.data)
		if (!UserStorage.getItem('user-name')) UserStorage.create(`${email}_${id}`)
		// TODO 'change all storage to user-storage
		return next()
	}
	console.warn(response)
	$snackBar.warning('You are not authorized')
	return redirect('/login')
}
