export interface Answer {
	id: number;
	created_at: string;
	updated_at: string;

	user: string;
	content: string;
	upvotes: number;
	downvotes: number;
	count: number;
	vote?: number;
	replies: Answer[];
}

export interface Question {
	id: number;
	created_at: string;
	updated_at: string;
	document: string;
	start: number;
	end: number;
	counter: number;
	answers: Answer[];
}

export interface Document {
	id: string;
	questions: Question[];
	url: string;
}
