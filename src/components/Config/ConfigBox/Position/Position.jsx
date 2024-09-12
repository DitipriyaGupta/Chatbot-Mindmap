import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useState } from "react";
import {
	Button,
	ButtonGroup,
	IconButton,
	InputAdornment,
	TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useChatConfigContext } from "../../ChatConfigContext/ChatConfigContext";

const PositionBox = () => {
	const { chatConfig, setChatConfig } = useChatConfigContext();

	const [custom, setCustom] = useState(
		chatConfig.positionRight === null ? "left" : "right"
	);
	return (
		<>
			<ButtonGroup disableElevation color="primary" variant="outlined">
				<Button
					variant={custom === "left" ? "contained" : "outlined"}
					onClick={() => {
						setChatConfig({
							positionLeft: 25,
							positionRight: null,
						});
						setCustom("left");
					}}
				>
					Left
				</Button>
				<Button
					onClick={() => {
						setChatConfig({
							positionLeft: null,
							positionRight: 25,
						});
						setCustom("right");
					}}
					variant={custom === "right" ? "contained" : "outlined"}
				>
					Right
				</Button>
			</ButtonGroup>
			{custom === "right" ? (
				<TextField
					value={String(parseInt(chatConfig.positionRight))}
					onChange={(e) =>
						setChatConfig({ positionRight: parseInt(e.target.value) })
					}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								{" "}
								<IconButton
									onClick={() =>
										setChatConfig({
											positionRight: parseInt(chatConfig.positionRight) + 1,
										})
									}
								>
									<Add />
								</IconButton>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								px{" "}
								<IconButton
									onClick={() =>
										setChatConfig({
											positionRight: parseInt(chatConfig.positionRight) - 1,
										})
									}
								>
									<Remove />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			) : (
				<TextField
					value={String(parseInt(chatConfig.positionLeft))}
					onChange={(e) =>
						setChatConfig({ positionLeft: parseInt(e.target.value) })
					}
					InputProps={{
						startAdornment: (
							<InputAdornment position="start">
								{" "}
								<IconButton
									onClick={() =>
										setChatConfig({
											positionLeft: parseInt(chatConfig.positionLeft) + 1,
										})
									}
								>
									<Add />
								</IconButton>
							</InputAdornment>
						),
						endAdornment: (
							<InputAdornment position="end">
								px{" "}
								<IconButton
									onClick={() =>
										setChatConfig({
											positionLeft: parseInt(chatConfig.positionLeft) - 1,
										})
									}
								>
									<Remove />
								</IconButton>
							</InputAdornment>
						),
					}}
				/>
			)}
			<label htmlFor="positionBottom">Bottom</label>
			<TextField
				value={String(parseInt(chatConfig.positionBottom))}
				onChange={(e) =>
					setChatConfig({ positionBottom: parseInt(e.target.value) })
				}
				InputProps={{
					startAdornment: (
						<InputAdornment position="start">
							{" "}
							<IconButton
								onClick={() =>
									setChatConfig({
										positionBottom: parseInt(chatConfig.positionBottom) + 1,
									})
								}
							>
								<Add />
							</IconButton>
						</InputAdornment>
					),
					endAdornment: (
						<InputAdornment position="end">
							px{" "}
							<IconButton
								onClick={() =>
									setChatConfig({
										positionBottom: parseInt(chatConfig.positionBottom) - 1,
									})
								}
							>
								<Remove />
							</IconButton>
						</InputAdornment>
					),
				}}
			/>
			<div
				style={{
					justifyContent: "flex-end",
				}}
			>
				<Button
					variant="outlined"
					color="primary"
					onClick={() => {
						setChatConfig({
							positionBottom: 25,
							positionRight: 25,
							positionLeft: "auto",
						});
					}}
				>
					Reset to Default
				</Button>
			</div>
		</>
	);
};

export default withErrorBoundary(PositionBox, "PositionBox");
