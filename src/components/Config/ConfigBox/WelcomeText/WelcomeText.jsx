import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";

const WelcomeText = (props) => {
	const [inputValue, setInputValue] = useState("");
	const {
		chatConfig: { welcomeText },
		setChatConfig,
	} = useChatConfigContext();

	const AddMessage = async () => {
		if (inputValue === "") return;
		setChatConfig({ welcomeText: [...welcomeText, inputValue] });
		setInputValue("");
	};

	const DeleteMessage = async (index) => {
		const newMessages = [...welcomeText];
		newMessages.splice(index, 1);
		setChatConfig({ welcomeText: newMessages });
	};
	return (
		<>
			{welcomeText?.map((message, index) => {
				return (
					<Question
						message={message}
						index={index}
						key={index}
						deleteMessage={DeleteMessage}
					/>
				);
			})}
			<TextField
				fullWidth
				id="welcomeMessages"
				label="Welcome Message"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				classes={{}}
				placeholder="Add a question"
				onKeyPress={(e) => {
					if (e.key === "Enter") {
						AddMessage();
					}
				}}
				InputProps={{
					endAdornment: (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}
						>
							<Button variant="outlined" color="primary" onClick={AddMessage}>
								Add
							</Button>
						</div>
					),
				}}
			/>
		</>
	);
};

const Question = ({ message, index, deleteMessage }) => {
	return (
		<div className="question">
			<span>
				{index + 1}. {message}
			</span>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
				}}
			>
				<Button
					variant="outlined"
					color="secondary"
					onClick={() => {
						deleteMessage(index);
					}}
				>
					Delete
				</Button>
			</div>
		</div>
	);
};

export default withErrorBoundary(WelcomeText, "WelcomeText");
