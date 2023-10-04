import type { PageLoad } from './$types';
import type { Course, Teaching, TeachingYear } from '$lib/teachings';
import { getManifest } from '$lib/api';
import TEACHINGS from '$lib/teachings';
import { error } from '@sveltejs/kit';

async function getActiveCourse(fetch: typeof window.fetch, teaching: Teaching) {
	try {
		await getManifest(fetch, teaching.url);
		return true;
	} catch {
		return false;
	}
}

async function getActiveCourses(fetch: typeof window.fetch, course: Course) {
	const allTeachings = course.years.flatMap((year: TeachingYear) => year.teachings);
	const activeTeachings: Teaching[] = [];

	const promises = allTeachings.map(async (teaching: Teaching) => {
		const isActive = await getActiveCourse(fetch, teaching);
		if (isActive) {
			activeTeachings.push(teaching);
		}
	});

	await Promise.allSettled(promises);

	return activeTeachings;
}

export const load = (async ({ fetch, params }) => {
	const course = TEACHINGS.find((c) => c.id === params.course);

	if (course == null) {
		throw error(404, `Course '${params.course}' not found`);
	}

	// Filter out inactive teachings
	const activeCourses = getActiveCourses(fetch, course);

	return {
		course,
		streaming: {
			activeCourses
		}
	};
}) satisfies PageLoad;
