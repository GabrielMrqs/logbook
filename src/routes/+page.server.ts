import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';

const toLocalMidnight = (value: string) => {
	const [dayStr, monthStr, yearStr] = value.split('/');
	const day = Number(dayStr);
	const month = Number(monthStr);
	const year = Number(yearStr);
	if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return null;
	const date = new Date(year, month - 1, day);
	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
	return date;
};

const toNullableString = (value: FormDataEntryValue | null) => {
	if (value === null) return null;
	const trimmed = String(value).trim();
	return trimmed.length === 0 ? null : trimmed;
};

const parseOptionalNumber = (value: FormDataEntryValue | null, label: string) => {
	if (value === null) return { value: null };
	const trimmed = String(value).trim();
	if (trimmed.length === 0) return { value: null };
	const numberValue = Number(trimmed);
	if (!Number.isFinite(numberValue)) {
		return { error: `${label} must be a number.` };
	}
	return { value: numberValue };
};

const formatDdMmYyyy = (value: Date) => {
	const day = String(value.getDate()).padStart(2, '0');
	const month = String(value.getMonth() + 1).padStart(2, '0');
	const year = String(value.getFullYear());
	return `${day}/${month}/${year}`;
};

const validateStarRating = (value: number | null, label: string) => {
	if (value === null) return null;
	if (!Number.isInteger(value) || value < 1 || value > 5) {
		return `${label} must be an integer between 1 and 5.`;
	}
	return null;
};

export const load: PageServerLoad = async ({ locals }) => {
	const today = new Date();
	const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const session = await locals.auth();

	if (!session?.user?.id) {
		return { entriesAsc: [], entriesRecent: [], today: formatDdMmYyyy(todayLocal), session: null };
	}

	const userId = session.user.id;
	const entriesAsc = await prisma.entry.findMany({
		where: { userId },
		orderBy: { date: 'asc' }
	});
	const entriesRecent = await prisma.entry.findMany({
		where: { userId },
		orderBy: { date: 'desc' },
		take: 14
	});

	return { entriesAsc, entriesRecent, today: formatDdMmYyyy(todayLocal), session };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Please sign in to save entries.' });
		}
		const userId = session.user.id;

		const formData = await request.formData();
		const dateValue = String(formData.get('date') ?? '').trim();
		if (!dateValue) {
			return fail(400, { error: 'Date is required.' });
		}
		const date = toLocalMidnight(dateValue);
		if (!date) {
			return fail(400, { error: 'Date must be in dd/MM/yyyy format.' });
		}

		const weightParsed = parseOptionalNumber(formData.get('weightKg'), 'Weight');
		if (weightParsed.error) {
			return fail(400, { error: weightParsed.error });
		}
		const weightKg = weightParsed.value;
		if (weightKg !== null && weightKg <= 0) {
			return fail(400, { error: 'Weight must be a positive number.' });
		}

		const bjjRatingParsed = parseOptionalNumber(formData.get('bjjRatingStars'), 'BJJ rating');
		if (bjjRatingParsed.error) {
			return fail(400, { error: bjjRatingParsed.error });
		}
		const bjjRatingStars = bjjRatingParsed.value;
		const bjjRatingError = validateStarRating(bjjRatingStars, 'BJJ rating');
		if (bjjRatingError) {
			return fail(400, { error: bjjRatingError });
		}

		const gymRatingParsed = parseOptionalNumber(formData.get('gymRatingStars'), 'Gym rating');
		if (gymRatingParsed.error) {
			return fail(400, { error: gymRatingParsed.error });
		}
		const gymRatingStars = gymRatingParsed.value;
		const gymRatingError = validateStarRating(gymRatingStars, 'Gym rating');
		if (gymRatingError) {
			return fail(400, { error: gymRatingError });
		}

		const ratingParsed = parseOptionalNumber(formData.get('ratingStars'), 'Rating');
		if (ratingParsed.error) {
			return fail(400, { error: ratingParsed.error });
		}
		const ratingStars = ratingParsed.value;
		const ratingError = validateStarRating(ratingStars, 'Rating');
		if (ratingError) {
			return fail(400, { error: ratingError });
		}

		const trainedBjj = formData.get('trainedBjj') === 'on';
		const wentGym = formData.get('wentGym') === 'on';

		await prisma.entry.upsert({
			where: { userId_date: { userId, date } },
			create: {
				date,
				userId,
				weightKg,
				trainedBjj,
				wentGym,
				bjjRatingStars,
				gymRatingStars,
				ratingStars,
				bjjComment: toNullableString(formData.get('bjjComment')),
				gymComment: toNullableString(formData.get('gymComment')),
				ratingComment: toNullableString(formData.get('ratingComment'))
			},
			update: {
				weightKg,
				trainedBjj,
				wentGym,
				bjjRatingStars,
				gymRatingStars,
				ratingStars,
				bjjComment: toNullableString(formData.get('bjjComment')),
				gymComment: toNullableString(formData.get('gymComment')),
				ratingComment: toNullableString(formData.get('ratingComment'))
			}
		});

		return { success: true };
	},
	delete: async ({ request, locals }) => {
		const session = await locals.auth();
		if (!session?.user?.id) {
			return fail(401, { error: 'Please sign in to delete entries.' });
		}
		const userId = session.user.id;

		const formData = await request.formData();
		const id = String(formData.get('id') ?? '').trim();
		if (!id) {
			return fail(400, { error: 'Missing entry id.' });
		}

		const result = await prisma.entry.deleteMany({ where: { id, userId } });
		if (result.count === 0) {
			return fail(404, { error: 'Entry not found.' });
		}
		return { success: true };
	}
};
