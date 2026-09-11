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

export const Route = createFileRoute("/signup")({
	component: SignUpPage,
});

interface FormErrors {
	email?: string;
	name?: string;
	password?: string;
	confirmPassword?: string;
	form?: string;
}

function validate(form: {
	email: string;
	name: string;
	password: string;
	confirmPassword: string;
}): FormErrors {
	const errors: FormErrors = {};

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
		errors.email = "Enter a valid email address";
	}
	if (form.name.trim().length < 3) {
		errors.name = "Name must be at least 3 characters";
	}
	if (form.password.length < 8) {
		errors.password = "Password must be at least 8 characters";
	} else if (!/[A-Za-z]/.test(form.password)) {
		errors.password = "Password must contain at least one letter";
	} else if (!/\d/.test(form.password)) {
		errors.password = "Password must contain at least one number";
	} else if (!/[^A-Za-z0-9]/.test(form.password)) {
		errors.password = "Password must contain at least one special character";
	}
	if (form.confirmPassword !== form.password) {
		errors.confirmPassword = "Passwords do not match";
	}

	return errors;
}

function SignUpPage() {
	const { status, refresh } = useAuth();
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [loading, setLoading] = useState(false);

	if (status === "authenticated") {
		return <Navigate to="/" />;
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const validation = validate({ email, name, password, confirmPassword });
		setErrors(validation);
		if (Object.keys(validation).length > 0) return;

		setLoading(true);
		try {
			await api.post<{ user: User }>("/auth/signup", { email, name, password });
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
			title="Create your account"
			subtitle="Fill in your details to get started."
			footer={
				<>
					Already have an account?{" "}
					<Link
						to="/signin"
						className="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Sign in
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
						htmlFor="name"
						className="block text-sm font-medium text-slate-700"
					>
						Name
					</label>
					<input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={inputClass}
						autoComplete="name"
					/>
					<FieldError message={errors.name} />
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
						autoComplete="new-password"
					/>
					<FieldError message={errors.password} />
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-slate-700"
					>
						Confirm password
					</label>
					<input
						id="confirmPassword"
						type="password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						className={inputClass}
						autoComplete="new-password"
					/>
					<FieldError message={errors.confirmPassword} />
				</div>

				<SubmitButton label="Sign up" loading={loading} />
			</form>
		</AuthLayout>
	);
}
