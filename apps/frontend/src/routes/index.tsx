import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/")({
	component: Home,
});

function Home() {
	const { user, status, signOut } = useAuth();

	if (status === "loading") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
				Loading…
			</div>
		);
	}

	if (status === "unauthenticated") {
		return <Navigate to="/signin" />;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
				<h1 className="text-2xl font-semibold text-slate-900">
					Welcome to the application.
				</h1>
				{user ? (
					<p className="mt-2 text-slate-500">Signed in as {user.email}</p>
				) : null}
				<button
					type="button"
					onClick={() => signOut()}
					className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
				>
					Log out
				</button>
			</div>
		</div>
	);
}
