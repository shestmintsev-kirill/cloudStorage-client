export default function middlewareFactory(context, middleware, index, redirect) {
	if (!middleware[index]) return context.next
	return () =>
		middleware[index]({
			...context,
			next: middlewareFactory(context, middleware, index + 1, redirect),
			redirect
		})
}
