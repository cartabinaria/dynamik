// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// GitHub user type for session
		interface GitHubUser {
			login: string;
			id: number;
			avatar_url: string;
			html_url: string;
			name?: string;
			email?: string;
			// Add more fields as needed from GitHub API
		}

		interface Locals {
			github_access_token?: string;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
