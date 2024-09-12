import chrome from "assets/browser/chrome.png";
import edge from "assets/browser/edge.png";
import firefox from "assets/browser/firefox.png";
import opera from "assets/browser/opera.png";
import safari from "assets/browser/safari.png";
import whatsapp from "assets/browser/whatsapp.png";
import { WHATSAPP_BROWSER } from "./constants";

export default function getBrowser(browser) {
	switch (browser) {
		case "Chrome":
		case "Chrome Frame":
		case "Headless Chrome":
		case "Chrome Mobile iOS":
		case "Chromium":
		case "Chrome Mobile":
		case "Chrome Webview":
		case "Google Search App":
			return chrome;
		case "Microsoft Edge":
		case "Microsoft Edge (Chromium)":
			return edge;
		case "Firefox Mobile iOS":
		case "Firebird":
		case "Fennec":
		case "Firefox":
		case "Firefox Focus":
		case "Firefox Reality":
		case "Firefox Rocket":
		case "Flock":
		case "Firefox Mobile":
		case "Fireweb":
		case "Fireweb Navigator":
			return firefox;
		case "Opera GX":
		case "Opera Neon":
		case "Opera Devices":
		case "Opera Mini":
		case "Opera Mobile":
		case "Opera":
		case "Opera Next":
		case "Opera Touch":
			return opera;
		case "Safari":
		case "Mobile Safari":
			return safari;
		case WHATSAPP_BROWSER:
			return whatsapp;
		default:
			return null; // Use a default icon for unknown browsers
	}
}
