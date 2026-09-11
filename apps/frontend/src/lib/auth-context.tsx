import type { ReactNode } from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import type { User } from "./api";
import { api } from "./api";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
	user: User | null;
	status: AuthStatus;
	refresh: () => Promise<void>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<AuthStatus>("loading");

	const refresh = useCallback(async () => {
		try {
			const me = await api.get<User>("/users/me");
			setUser(me);
			setStatus("authenticated");
		} catch {
			setUser(null);
			setStatus("unauthenticated");
		}
	}, []);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const signOut = useCallback(async () => {
		await api.post("/auth/signout");
		setUser(null);
		setStatus("unauthenticated");
	}, []);

	const value = useMemo(
		() => ({ user, status, refresh, signOut }),
		[user, status, refresh, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
