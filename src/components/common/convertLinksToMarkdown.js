import { URL_PATTERN_REGEX } from "./constants";

function getFormattedLink(link) {
	const needsFormatting =
		!link.startsWith("http://") &&
		!link.startsWith("https://") &&
		!link.startsWith("mailto") &&
		!link.startsWith("ftp://") &&
		!link.startsWith("file://") &&
		!link.startsWith("tel:");

	// If it starts with 'www.', add 'http://' prefix
	return needsFormatting ? `http://${link}` : link;
}
export default function convertLinksToMarkdown(text) {
	if (!text) return text;

	// Capture and store all markdown links
	let markdownLinks = [];
	let tempText = text.replace(
		/(?:\[(.*?)\])\((.*?)\)/gm,
		(match, cite, link) => {
			// If it starts with 'www.', add 'http://' prefix
			const formattedURL = getFormattedLink(link);
			markdownLinks.push(`[${cite}](${formattedURL})`);
			return `{{MDLINK${markdownLinks.length - 1}}}`;
		}
	);

	// Replace all URLs with markdown links

	tempText = tempText.replace(URL_PATTERN_REGEX, (url) => {
		// If it starts with 'www.', add 'http://' prefix
		const formattedURL = getFormattedLink(url);

		return `[${url}](${formattedURL})`;
	});

	// Put back all the previous markdown links in their original positions
	let resultText = tempText.replace(/\{\{MDLINK(\d+)\}\}/g, (match, p1) => {
		return markdownLinks[parseInt(p1)];
	});

	return resultText;
}
