import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface AuthLayoutProps {
	title: string;
	subtitle?: string;
	children: ReactNode;
	footer?: ReactNode;
}

const inputClass =
	"w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export function AuthLayout({
	title,
	subtitle,
	children,
	footer,
}: AuthLayoutProps) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
			<div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
				<Link to="/" className="text-2xl font-semibold text-slate-900">
					Nest Auth
				</Link>
				<h1 className="mt-6 text-xl font-semibold text-slate-900">{title}</h1>
				{subtitle ? (
					<p className="mt-1 text-sm text-slate-500">{subtitle}</p>
				) : null}
				<div className="mt-6">{children}</div>
				{footer ? (
					<div className="mt-6 text-sm text-slate-500">{footer}</div>
				) : null}
			</div>
		</div>
	);
}

export function FieldError({ message }: { message?: string }) {
	if (!message) return null;
	return <p className="mt-1 text-sm text-red-600">{message}</p>;
}

export function SubmitButton({
	label,
	loading,
}: {
	label: string;
	loading: boolean;
}) {
	return (
		<button
			type="submit"
			disabled={loading}
			className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? "Please wait…" : label}
		</button>
	);
}

export { inputClass };
