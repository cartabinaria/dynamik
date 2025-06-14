import { persisted } from 'svelte-local-storage-store';

export const themes = ['halloween', 'autumn', 'dracula', 'light', 'dark'] as const;

type Theme = (typeof themes)[number];

export const DEFAULT_COURSE_KEY = 'default';

export interface Settings {
	theme: Theme;
	newTab: boolean;
	isoDates: boolean;
	defaultCourse: string;
}

const settings = persisted<Settings>('settings', {
	theme: 'dark',
	newTab: false,
	defaultCourse: DEFAULT_COURSE_KEY,
	isoDates: false
});

export default settings;
