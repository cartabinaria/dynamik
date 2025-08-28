<script lang="ts">
import type { Question, Answer } from '$lib/polleg';
import { QUESTION_URL, ANSWERS_URL } from '$lib/const';

import Answer from '$lib/components/polleg/Answer.svelte';

import ReplyBox from '$lib/components/polleg/ReplyBox.svelte';

export let question: Question;

let expanded: bool = false;
let loading: bool = true;
let spinner: HTMLSpanElement;

const sortCriteria = (a: Anwer, b: Anwer) => {
  let x: number = a.count;
  let y: number = b.count;
  if (x > y) {
    return -1;
  }
  if (x < y) {
    return 1;
  }
  return 0;
};

const load = async () => {
  if(!expanded)
    return

  const res = await fetch(QUESTION_URL(question.id));
  const data = await res.json();

  if (!data.answers)
    data.answers = []

  question.answers = data.answers.sort(sortCriteria)
  loading = false
};

const addAnswer = async (body: string, parent?: number): bool => {
  let answer = { question: question.id, content: body };
  if (parent)
    answer.parent = parent;

  let req = await fetch(ANSWERS_URL, {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(answer),
    method: 'PUT',
    credentials: 'include'
  });

  let res = await req.json();
  const success = 'id' in res; // An ID is provided when a new answer is inserted succesffuly
  if (success)
    load()
  return success
}

$: expanded, load();

</script>

<div class="flex items-center flex-col pb-6">
  {#if expanded}
    {#if loading}
    <span bind:this={spinner} class="loading loading-spinner loading-md my-4" />
    {:else}
      {#each question.answers as answer}
        <Answer {answer} />
      {/each}
    {/if}
    <ReplyBox submit={addAnswer} />
  {/if}
  <button class="btn btn-primary" on:click|preventDefault={() => {expanded = !expanded; loading = true}}>
    {!expanded ? 'Show answers' : 'Hide answers'}
  </button>
</div>
