import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import {
	FormControlLabel,
	MenuItem,
	Switch,
	TextField,
} from "@mui/material";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";
import { useUserContext } from "context/UserContext";

const AdvanceBox = () => {
	const { chatConfig, setChatConfig, businessActions } = useChatConfigContext();
	const {
		user: { is_god },
	} = useUserContext();
	return (
		<>
			{is_god ? (
				<TextField
					label="Powered By URL"
					placeholder="https://beyondchats.com"
					value={chatConfig.redirect_url}
					onChange={(e) => setChatConfig({ redirect_url: e.target.value })}
				/>
			) : null}
			<FormControlLabel
				control={
					<Switch
						checked={chatConfig.askEmail}
						color="primary"
						onChange={(e) =>
							setChatConfig({ askEmail: Number(e.target.checked) })
						}
					/>
				}
				label="Ask User to Signin"
			/>
			<FormControlLabel
				control={
					<Switch
						checked={chatConfig.instant_emailers}
						color="primary"
						onChange={(e) =>
							setChatConfig({ instant_emailers: Number(e.target.checked) })
						}
					/>
				}
				label="Users with Sales Role instantly get a Mail on new chats"
			/>
			<FormControlLabel
				control={
					<Switch
						checked={chatConfig.idle_user_emailers}
						color="primary"
						onChange={(e) =>
							setChatConfig({ idle_user_emailers: Number(e.target.checked) })
						}
					/>
				}
				label="Chatbot users get a Thank You Mail to at the end of the day"
			/>
			<FormControlLabel
				control={
					<Switch
						checked={chatConfig.message_limit.enable}
						color="primary"
						onChange={(e) =>
							setChatConfig({
								message_limit: {
									...chatConfig.message_limit,
									enable: Number(e.target.checked),
								},
							})
						}
					/>
				}
				label="Limit the number of chats a user can make in a day"
			/>

			{chatConfig.message_limit.enable ? (
				<>
					<TextField
						label="Daily Limit"
						placeholder="100"
						value={String(
							parseInt(chatConfig.message_limit.daily_messages_limit)
						)}
						onChange={(e) => {
							setChatConfig({
								message_limit: {
									...chatConfig.message_limit,
									daily_messages_limit: parseInt(e.target.value) || 0,
								},
							});
						}}
						type="number"
					/>
					<TextField
						label="Message"
						placeholder="https://beyondchats.com"
						value={chatConfig.message_limit.limit_message}
						onChange={(e) =>
							setChatConfig({
								message_limit: {
									...chatConfig.message_limit,
									limit_message: e.target.value,
								},
							})
						}
						helperText="Message the user will see when the limit is reached"
					/>
					<TextField
						select
						label="Business Action"
            defaultValue={chatConfig.message_limit.action_id}
            sx={{ minWidth: 80 }}
						onChange={(e) =>
							setChatConfig({
								message_limit: {
									...chatConfig.message_limit,
									action_id: e.target.value,
								},
							})
						}
					>
						<MenuItem value="">No Action</MenuItem>
						{businessActions.map((businessAction) => (
							<MenuItem value={businessAction.id} key={businessAction.id}>
								{businessAction.name}
							</MenuItem>
						))}
					</TextField>
				</>
			) : null}
		</>
	);
};

export default withErrorBoundary(AdvanceBox, "AdvanceBox");
