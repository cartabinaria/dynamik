interface Answer {
  id: number;
  created_at: string;
  updated_at: string;

  user: string;
  content: string;
  upvotes: number;
  downvotes: number;
  replies: Answer[];
}

interface Question {
  id: number;
  created_at: string;
  updated_at: string;
  document: string;
  start: number;
  end: number;
  counter: number;
  answers: Answer[];
}

interface Document {
  id: string;
  questions: Question[];
  url: string;
}
