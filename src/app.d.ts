// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '@auth/core/types';

declare global {
	namespace App {
		interface Locals {
			auth: () => Promise<Session | null>;
		}
	}
}

declare module '@auth/core/types' {
	interface Session {
		user?: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
		};
	}
}

export {};
