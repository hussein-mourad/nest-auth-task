import {
	createFileRoute,
	Link,
	Navigate,
	useNavigate,
} from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import {
	AuthLayout,
	FieldError,
	inputClass,
	SubmitButton,
} from "../components/AuthLayout";
import type { User } from "../lib/api";
import { ApiError, api } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/signin")({
	component: SignInPage,
});

interface FormErrors {
	email?: string;
	password?: string;
	form?: string;
}

function SignInPage() {
	const { status, refresh } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [loading, setLoading] = useState(false);

	if (status === "authenticated") {
		return <Navigate to="/" />;
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();

		const validation: FormErrors = {};
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			validation.email = "Enter a valid email address";
		}
		if (!password) {
			validation.password = "Password is required";
		}
		setErrors(validation);
		if (Object.keys(validation).length > 0) return;

		setLoading(true);
		try {
			await api.post<{ user: User }>("/auth/signin", { email, password });
			await refresh();
			navigate({ to: "/" });
		} catch (error) {
			setErrors({
				form:
					error instanceof ApiError ? error.message : "Something went wrong",
			});
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthLayout
			title="Welcome back"
			subtitle="Sign in to your account."
			footer={
				<>
					Don&apos;t have an account?{" "}
					<Link
						to="/signup"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign up
					</Link>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="space-y-4" noValidate>
				{errors.form ? (
					<p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
						{errors.form}
					</p>
				) : null}

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-slate-700"
					>
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={inputClass}
						autoComplete="email"
					/>
					<FieldError message={errors.email} />
				</div>

				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-slate-700"
					>
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className={inputClass}
						autoComplete="current-password"
					/>
					<FieldError message={errors.password} />
				</div>

				<SubmitButton label="Sign in" loading={loading} />
			</form>
		</AuthLayout>
	);
}
