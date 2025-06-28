<script lang="ts">
	import { page } from '$app/state';
  import githubLogo from '$lib/assets/github.svg';
  let redirect = $derived(page.url.searchParams.get('redirect') ?? '');
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh]">
  <h1 class="text-3xl font-bold mb-6">Login</h1>
  <form method="POST" action="/api/login/github">
    <input type="hidden" name="redirect" value={redirect} />
    <button type="submit" class="btn btn-primary btn-wide flex items-center gap-2">
      <img src={githubLogo} alt="GitHub" class="w-5 h-5" />
      Login with GitHub
    </button>
  </form>
</div>
