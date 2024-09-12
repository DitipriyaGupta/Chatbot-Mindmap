import baseDomain from "./baseDomain";

export default function addBeyondChat() {
	const script = document.createElement("script");
	script.src = `${
		baseDomain.integrationRoute
	}/chat-widget?orgId=${localStorage.getItem("host_url")}`;
	script.async = true;

	// Append the script to the document's body
	document.body.appendChild(script);

	// Clean up function to remove the script when component unmounts
	return () => {
		console.log("removed");
		// Remove the script element from the document's body
		try {
			document.body.removeChild(script);
			document.body.removeChild(document.getElementById("beyond-chats-widget"));
		} catch (error) {
			console.error(error);
		}
	};
}
