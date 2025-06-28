<script lang="ts">
	import type { GitHubUser } from '$lib/server/github/githubApi';

	let { user }: { user: GitHubUser | null; transparentBg?: boolean } = $props();
</script>

{#if user}
	<div class="dropdown dropdown-end">
		<button
			type="button"
			class="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-lg bg-primary/10 border border-primary/30 shadow-sm hover:bg-primary/20 transition-colors"
			aria-haspopup="true"
			aria-expanded="false"
		>
			<div class="avatar">
				<div class="w-7 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
					<img src={user.avatar_url} alt="User avatar" />
				</div>
			</div>
			<span class="font-semibold text-primary flex items-center gap-1">
				<span class="icon-[mdi--github] text-lg"></span>
				@{user.login}
			</span>
			<span class="icon-[mdi--chevron-down] text-lg text-primary"></span>
		</button>
		<ul
			class="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-40 mt-2 border border-base-300"
		>
			<form method="POST" action="/api/logout">
				<button
					type="submit"
					class="px-4 cursor-pointer py-2 border-0 w-full transition-all hover:bg-red-700 hover:text-white rounded"
				>
					<span class="icon-[mdi--logout]"></span>
					Logout
				</button>
			</form>
		</ul>
	</div>
{:else}
	<div class="flex items-center gap-2">
		<a
			href="/login"
			class="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-gray-800 text-white font-semibold shadow transition-colors duration-150"
			aria-label="Login with GitHub"
		>
			<span class="icon-[mdi--github] text-xl"></span>
			<span>Sign in</span>
		</a>
	</div>
{/if}
