// SPDX-FileCopyrightText: 2024 Eyad Issa <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import sha256 from 'sha256';
import { error, redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';
import { ASSET_URL, DOCUMENT_URL, GH_PAGES_BASE_URL } from '$lib/const';
import type { Document, Question } from '$lib/polleg';

export const load: PageLoad = async ({ fetch, params }) => {
  const filePath = params.dir + '/' + params.file;
  const fileUrl = ASSET_URL(filePath);

  // check if the user agent is iOS
  const isIOS = !import.meta.env.SSR && navigator.userAgent.match(/(iPad|iPhone|iPod)/g); // ! workaround
  if (isIOS) {
    // redirect to the original file
    redirect(302, fileUrl);
  }

  // If the file is an exam, fetch the questions' document and load polleg
  if (params.file.includes('testo')) {
    const GHFileUrl = GH_PAGES_BASE_URL + '/' + filePath;
    const res = await fetch(GHFileUrl, {});

    if (res.status == 200) {
      const id = sha256(filePath);

      const docRes = await fetch(DOCUMENT_URL(id), {});

      let questions: Question[] = [];
      const body: Document | { error: string } = await docRes.json();
      if ('error' in body && docRes.status != 404) {
        error(500, { message: "Could not fetch document questions" })
      } else if (!('error' in body)) {
        // set the questions if it's not an error
        questions = body.questions;
      }

      return {
        url: fileUrl,
        id: id,
        questions,
      };
    }
  }

  return {
    url: fileUrl,
  };
};
