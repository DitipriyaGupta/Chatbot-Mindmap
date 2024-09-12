import desktop from "assets/device/desktop.png";
import smartphone from "assets/device/smartphone.png";
import tablet from "assets/device/tablet.png";
import television from "assets/device/television.png";

export default function getDevice(device) {
	switch (device) {
		case "desktop":
			return desktop;
		case "smartphone":
			return smartphone;
		case "tablet":
			return tablet;
		case "television":
			return television;
		default:
			return null;
	}
}
