import { PrismaAdapter } from '@auth/prisma-adapter';
import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { AUTH_SECRET } from '$env/static/private';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import { prisma } from '$lib/server/db';

export const { handle, signIn, signOut, GET, POST } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			clientId: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET
		})
	],
	secret: AUTH_SECRET,
	trustHost: true,
	callbacks: {
		session: ({ session, user }) => {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		}
	}
});
