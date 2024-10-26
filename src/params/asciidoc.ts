import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^.+\.(asciidoc|adoc)$/.test(param);
