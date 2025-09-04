// FAQ data structure
export interface FAQ {
	question: string;
	answer: string;
}

export const metadata = {
	title: "FAQ - Domande Frequenti",
	description: "Risposte alle domande più comuni su Dynamik"
};

export const faqs: FAQ[] = [
	{
		question: "Come creo un account?",
		answer: "Per creare un account clicca sul pulsante \"Accedi\" in alto a destra e seleziona l'opzione di registrazione. Puoi registrarti utilizzando il tuo account GitHub per un accesso più rapido e sicuro."
	},
	{
		question: "Ho dimenticato la password, cosa faccio?",
		answer: "Se hai effettuato l'accesso tramite GitHub, utilizza le opzioni di recupero password di GitHub. Per altri metodi di accesso, contatta l'amministratore del sistema."
	},
	{
		question: "Come carico un documento?",
		answer: "Vai nella sezione appropriata del sito e utilizza la funzione di upload. Assicurati che il file sia in formato supportato (PDF, Markdown, etc.) e non superi la dimensione massima consentita."
	},
	{
		question: "Come funziona il sistema di voti nelle risposte?",
		answer: "Puoi votare le risposte utilizzando le frecce verso l'alto (upvote) o verso il basso (downvote). I voti aiutano a identificare le risposte più utili e accurate per la comunità."
	},
	{
		question: "Il PDF non si carica, perché?",
		answer: "Controlla che il file sia un PDF valido, non corrotto e non superi i limiti di dimensione. Verifica anche la tua connessione internet. Se il problema persiste, prova a ricaricare la pagina."
	},
	{
		question: "Come funziona il sistema Polleg?",
		answer: "Polleg è il sistema per gestire domande e risposte su documenti PDF. Puoi fare domande su specifiche sezioni del documento e ricevere risposte dalla comunità. Le domande sono collegate visualmente al documento tramite bookmark interattivi."
	},
	{
		question: "Posso modificare o eliminare le mie risposte?",
		answer: "Sì, puoi eliminare le tue risposte utilizzando il pulsante di eliminazione che appare sulle risposte che hai scritto. Le modifiche non sono attualmente supportate, ma puoi eliminare e riscrivere una risposta se necessario."
	},
	{
		question: "Come vengono gestiti i permessi di eliminazione?",
		answer: "Solo l'autore di una risposta o un amministratore può eliminarla. Il sistema verifica automaticamente i permessi in base al tuo account e ruolo."
	},
	{
		question: "Posso rispondere anonimamente?",
		answer: "Sì, quando scrivi una risposta puoi scegliere l'opzione \"Pubblica anonimamente\" per nascondere la tua identità. Tuttavia, alcune funzionalità potrebbero essere limitate per le risposte anonime."
	},
	{
		question: "Come segnalo contenuti inappropriati?",
		answer: "Contatta gli amministratori del sistema attraverso i canali ufficiali se trovi contenuti inappropriati o che violano le regole della community."
	}
];
