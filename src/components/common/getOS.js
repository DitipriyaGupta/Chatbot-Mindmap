import android from "assets/os/android.png";
import apple from "assets/os/apple.png";
import linux from "assets/os/linux.png";
import ubuntu from "assets/os/ubuntu.png";
import windows from "assets/os/windows.png";
import chrome from "assets/os/chrome.png";

export default function getOS(os) {
	switch (os) {
		case "Android":
			return android;
		case "Apple TV":
		case "iOS":
		case "Mac":
			return apple;
		case "Chrome OS":
			return chrome;
		case "Linux":
		case "Arch Linux":
		case "CentOS":
		case "Debian":
		case "Deepin":
		case "Fedora":
		case "Gentoo":
		case "GNU/Linux":
		case "Kubuntu":
		case "Lubuntu":
		case "VectorLinux":
		case "Mint":
		case "NetBSD":
		case "FreeBSD":
		case "OpenBSD":
		case "Slackware":
		case "Solaris":
		case "Syllable":
		case "Red Hat":
		case "SUSE":
			return linux;
		case "Ubuntu":
		case "KaiOS":
		case "Sailfish OS":
		case "Tizen":
		case "Remix OS":
			return ubuntu;
		case "Windows":
		case "Windows CE":
		case "Windows IoT":
		case "Windows Mobile":
		case "Windows Phone":
		case "Windows RT":
			return windows;
		default:
			return null; // Use a default icon for unknown OS
	}
}
