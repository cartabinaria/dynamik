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
	document_path?: string;
	start: number;
	end: number;
	counter: number;
	answers: Answer[];
	username?: string;
	user_avatar_url?: string;
}

export interface Document {
	id: string;
	questions: Question[];
	url: string;
}

export interface Logs {
	timestamp: string;
	action: string;
	item_type: string;
	item_id: string;
	username: string;
	user_avatar_url: string;
}

export interface Report {
	id: number;
	cause: string;
	created_at: string;
	username: string;
	user_avatar_url: string;
	answer_id: number;
	answer: Answer;
}
