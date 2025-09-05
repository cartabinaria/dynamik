// SPDX-FileCopyrightText: 2023 - 2025 Alice Benatti <alice17bee@gmail.com>
// SPDX-FileCopyrightText: 2023 - 2025 Eyad Issa <eyadlorenzo@gmail.com>
// SPDX-FileCopyrightText: 2024 Samuele Musiani <samu@teapot.ovh>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

const ORG = 'cartabinaria';
export const RISORSE_BASE_URL =
  import.meta.env.VITE_RISORSE_BASE_URL || 'https://dynamik.vercel.app/';
export const GH_PAGES_BASE_URL = `https://${ORG}.github.io`;
const GH_BASE_URL = `https://github.com/${ORG}`;
const GH_DEV_BASE_URL = `https://github.dev/${ORG}`;
export const STATIK_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}/statik.json`;
export const ASSET_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}`;
export const FUZZY_URL = (path: string) => `${GH_PAGES_BASE_URL}/${path}/fuzzy.json`;
export const EDIT_URLS = (path: string) => {
  const [, repo, ...rest] = path.split('/');
  const filePath = rest.join('/');
  return {
    github: `${GH_BASE_URL}/${repo}/blob/main/${filePath}`,
    github_repo: `${GH_BASE_URL}/${repo}`,
    github_edit: `${GH_BASE_URL}/${repo}/edit/main/${filePath}`,
    github_dev: `${GH_DEV_BASE_URL}/${repo}/blob/main/${filePath}`
  };
};
export const MAX_YEARS_FOR_DEGREE = 3;

export const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL || 'https://cslogin.students.cs.unibo.it';
export const LOGIN_URL = (current_uri: URL) => `${AUTH_BASE_URL}/login?redirect_uri=${current_uri}`;
export const WHOAMI_URL = `${AUTH_BASE_URL}/whoami`;
export const LOGOUT_URL = (current_uri: URL) =>
  `${AUTH_BASE_URL}/logout?redirect_uri=${current_uri}`;

export const POLLEG_BASE_URL =
  import.meta.env.VITE_POLLEG_BASE_URL || 'https://polleg.students.cs.unibo.it';
export const DOCUMENTS_URL = `${POLLEG_BASE_URL}/documents`;
export const QUESTIONS_URL = `${POLLEG_BASE_URL}/questions`;
export const IMAGES_URL = `${POLLEG_BASE_URL}/images`;
export const ANSWERS_URL = `${POLLEG_BASE_URL}/answers`;
export const DOCUMENT_URL = (id: string) => `${DOCUMENTS_URL}/${id}`;
export const QUESTION_URL = (id: number) => `${QUESTIONS_URL}/${id}`;
export const ANSWER_URL = (id: number) => `${ANSWERS_URL}/${id}`;
export const VOTE_URL = (id: number) => `${ANSWER_URL(id)}/vote`;
export const PROPOSAL_URL = (id: number) => `${POLLEG_BASE_URL}/proposal`;
