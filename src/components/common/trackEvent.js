import { Post } from "./common";

/**
 * Track an event related to a chat session.
 * @async
 * @param {Object} options - The options object containing details of the event.
 * @param {string} options.chat_id - The ID of the chat session.
 * @param {number} options.event_id - The ID of the event. Use one of the predefined constants:
 *     - SUGGESTED_QUESTION_CLICKED (2)
 *     - ACTION_BUTTON_CLICKED (5)
 *     - USER_CLOSED_CHATBOT (11)
 *     - PAGE_SWITCHED (12)
 * @param {string} [options.suggested_question_id] - The ID of the suggested question (optional).
 * @param {number} [options.action_id] - The ID of the action (optional).
 * @param {string} [options.action_value] - The value of the action (optional).
 * @param {string} [options.actions_message_id] - The id of the message whose action was clicked (optional).
 * @param {string} [options.page_url] - The URL of the page where the event occurred (optional).
 * @returns {Promise<void>} - A promise that resolves when the event is tracked.
 */
export default async function trackEvent({
	chat_id,
	event_id,
	suggested_question_id,
	action_id,
	action_value,
	actions_message_id,
	page_url,
}) {
	try {
		Post(1, "track_event", {
			chat_id,
			event_id,
			suggested_question_id,
			action_id,
			action_value,
			actions_message_id,
			page_url,
		});
	} catch (error) {
		console.error(error);
	}
}

// trackEvent({
// 	chat_id: 3568,
// 	event_id: SUGGESTED_QUESTION_CLICKED,
// 	suggested_question_id: 2470,
// });
// trackEvent({
// 	chat_id: 3568,
// 	event_id: ACTION_BUTTON_CLICKED,
// 	action_id: 5,
// 	action_value: "click",
// });
// trackEvent({ chat_id: 3568, event_id: AGENT_JOINED });
// trackEvent({ chat_id: 3568, event_id: AGENT_LEFT });
// trackEvent({ chat_id: 3568, event_id: USER_CLOSED_CHATBOT });
// trackEvent({
// 	chat_id: 3568,
// 	event_id: PAGE_SWITCHED,
// 	page_url: "www.google.com",
// });
