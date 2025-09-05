<!--
SPDX-FileCopyrightText: 2025 Alice Benatti <alice17bee@gmail.com>
SPDX-FileCopyrightText: 2025 Eyad Issa <eyadlorenzo@gmail.com>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<script lang="ts">
	import { LOGIN_URL, LOGOUT_URL } from '$lib/const';
	import { auth, isAuthenticated } from '$lib/stores/auth';
	import { fly } from 'svelte/transition';

	interface Props {
		class?: string;
		url: URL;
	}

	let { class: className = '', url }: Props = $props();
</script>

<div class="relative {className}">
	{#if isAuthenticated($auth)}
		<div class="dropdown dropdown-end">
			<div
				tabindex="0"
				role="button"
				class="btn btn-ghost btn-circle avatar hover:shadow-lg transition-all duration-200 hover:scale-105"
			>
				<div
					class="w-10 rounded-full ring-2 ring-transparent hover:ring-primary hover:ring-offset-2 transition-all duration-200"
				>
					<img
						src={$auth.user.avatarUrl}
						alt="{$auth.user.name || $auth.user.username}'s avatar"
						class="rounded-full object-cover"
					/>
				</div>
			</div>
			<div class="dropdown-content z-[1] mt-3">
				<div class="card bg-base-100 shadow-xl border border-base-300 w-80">
					<div class="card-body p-4">
						<!-- User Info Header -->
						<div class="flex items-center gap-3 pb-3 border-b border-base-200">
							<div class="avatar">
								<div class="w-12 rounded-full ring-2 ring-primary ring-offset-2">
									<img
										src={$auth.user.avatarUrl}
										alt="{$auth.user.name || $auth.user.username}'s avatar"
										class="rounded-full object-cover"
									/>
								</div>
							</div>
							<div class="flex-1 min-w-0">
								<p class="font-semibold text-base-content truncate">
									{$auth.user.name || $auth.user.username}
								</p>
								<p class="text-sm text-base-content/70 truncate">
									@{$auth.user.username}
								</p>
								{#if $auth.user.email}
									<p class="text-xs text-base-content/50 truncate">
										{$auth.user.email}
									</p>
								{/if}
							</div>
							{#if $auth.user.admin}
								<div class="badge badge-primary badge-sm">Admin</div>
							{/if}
						</div>

						<!-- Menu Items -->
						<div class="menu p-0 mt-2 w-70">
							<li>
								<!-- TODO: route page of pdf approve dash -->
								<a
									href="#"
									class="flex items-center gap-3 rounded-lg hover:bg-base-200 transition-colors duration-150"
								>
									<!-- <span class="icon-[ic--round-approval] text-lg"></span>
									<span class="icon-[ic--round-fact-check] text-lg"></span>
									<span class="icon-[ic--round-assignment-turned-in] text-lg"></span>
									<span class="icon-[ic--round-rule] text-lg"></span>
									<span class="icon-[ic--round-verified] text-lg"></span>
									<span class="icon-[ic--round-rate-review] text-lg"></span>
									<span class="icon-[ic--round-admin-panel-settings] text-lg"></span>
									<span class="icon-[ic--round-checklist] text-lg"></span>
									<span class="icon-[ic--round-pending-actions] text-lg"></span> -->
									<span class="icon-[ic--round-task-alt] text-lg"></span>

									<span class="flex-1">Q&A approve</span>
									<span class="badge badge-ghost badge-sm">Soon</span>
								</a>
							</li>
							<li>
								<a
									href="/settings"
									class="flex items-center gap-3 rounded-lg hover:bg-base-200 transition-colors duration-150"
								>
									<span class="icon-[ic--round-settings] text-lg"></span>
									Settings
								</a>
							</li>
							<div class="divider my-1"></div>
							<li>
								<a
									href={encodeURI(LOGOUT_URL(url))}
									class="flex items-center gap-3 rounded-lg hover:bg-error hover:text-error-content transition-colors duration-150 text-error"
								>
									<span class="icon-[ic--round-logout] text-lg"></span>
									Logout
								</a>
							</li>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<a
			class="btn btn-ghost hover:bg-primary rounded-lg hover:text-primary-content transition-all duration-200 hover:shadow-md"
			href={encodeURI(LOGIN_URL(url))}
			title="Login with GitHub"
		>
			<!-- Show full text on desktop, only icon on mobile -->
			<span class="hidden sm:inline">Login with GitHub</span>
			<span class="sm:hidden">Login</span>
			<span class="icon-[akar-icons--github-fill] text-lg"></span>
		</a>
	{/if}
</div>
