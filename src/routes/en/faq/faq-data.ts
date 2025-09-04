// FAQ data structure
export interface FAQ {
	question: string;
	answer: string;
}

export const metadata = {
	title: "FAQ - Frequently Asked Questions",
	description: "Answers to the most common questions about Dynamik"
};

export const faqs: FAQ[] = [
	{
		question: "How do I create an account?",
		answer: "To create an account, click the \"Login\" button in the top right corner and select the registration option. You can register using your GitHub account for faster and more secure access."
	},
	{
		question: "I forgot my password, what should I do?",
		answer: "If you logged in through GitHub, use GitHub's password recovery options. For other login methods, contact the system administrator."
	},
	{
		question: "How do I upload a document?",
		answer: "Go to the appropriate section of the site and use the upload function. Make sure the file is in a supported format (PDF, Markdown, etc.) and doesn't exceed the maximum allowed size."
	},
	{
		question: "How does the voting system work for answers?",
		answer: "You can vote on answers using the up arrow (upvote) or down arrow (downvote). Votes help identify the most useful and accurate answers for the community."
	},
	{
		question: "The PDF won't load, why?",
		answer: "Check that the file is a valid, uncorrupted PDF and doesn't exceed size limits. Also verify your internet connection. If the problem persists, try refreshing the page."
	},
	{
		question: "How does the Polleg system work?",
		answer: "Polleg is the system for managing questions and answers on PDF documents. You can ask questions about specific sections of the document and receive answers from the community. Questions are visually linked to the document through interactive bookmarks."
	},
	{
		question: "Can I edit or delete my answers?",
		answer: "Yes, you can delete your answers using the delete button that appears on answers you've written. Editing is not currently supported, but you can delete and rewrite an answer if necessary."
	},
	{
		question: "How are deletion permissions managed?",
		answer: "Only the author of an answer or an administrator can delete it. The system automatically verifies permissions based on your account and role."
	},
	{
		question: "Can I reply anonymously?",
		answer: "Yes, when writing an answer you can choose the \"Post anonymously\" option to hide your identity. However, some features may be limited for anonymous replies."
	},
	{
		question: "How do I report inappropriate content?",
		answer: "Contact the system administrators through official channels if you find inappropriate content or content that violates community rules."
	}
];
