import { json } from '@sveltejs/kit';

export const GET = ({ request, url }) =>
	json({
		origin: url.origin,
		protocol: url.protocol,
		host: url.host,
		xfProto: request.headers.get('x-forwarded-proto'),
		xfHost: request.headers.get('x-forwarded-host'),
		cfVisitor: request.headers.get('cf-visitor')
	});
