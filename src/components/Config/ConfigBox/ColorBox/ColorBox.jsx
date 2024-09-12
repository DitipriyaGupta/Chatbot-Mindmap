import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import UniversalColorPicker from "./ColorPicker";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";

const ColorBox = () => {
	const { chatConfig, setChatConfig } = useChatConfigContext();
	return (
		<>
			<UniversalColorPicker
				value={chatConfig.themeBackground}
				onChange={(themeBackground) => setChatConfig({ themeBackground })}
				TextFieldProps={{
					label: "Primary Background Color",
					helperText:
						"This is the background color for main elements like the header, user chats, buttons etc.",
				}}
			/>

			<UniversalColorPicker
				value={chatConfig.themeColor}
				onChange={(themeColor) => setChatConfig({ themeColor })}
				TextFieldProps={{
					label: "Primary Text Color",
					helperText:
						"This is the text color for elements on the primary background color.",
				}}
			/>
			<UniversalColorPicker
				value={chatConfig.chatBackground}
				onChange={(chatBackground) => setChatConfig({ chatBackground })}
				TextFieldProps={{
					label: "Secondary Background Color",
					helperText:
						"This is the background color for chat bubbles in the conversation, such as bot chat bubbles",
				}}
			/>

			<UniversalColorPicker
				value={chatConfig.chatColor}
				onChange={(chatColor) => setChatConfig({ chatColor })}
				TextFieldProps={{
					label: "Secondary Color",
					helperText: "This is the text color for text within bot chat bubbles",
				}}
			/>
		</>
	);
};

export default withErrorBoundary(ColorBox, "ColorBox");
