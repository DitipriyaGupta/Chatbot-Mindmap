import React, { useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import { CircularProgress, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import MetaHelmet from "../common/MetaHelmet";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useApiCall } from "components/common/appHooks";

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		display: "flex",
		gap: 5,
		flexDirection: "column",
	},
}));

export default function ForgotPassword() {
	const { Post } = useApiCall();
	const classes = useStyles();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			email: "",
		},
	});
	const [passwordLoading, setPasswordLoading] = useState(false);
	const history = useHistory();

	async function handleResetPassword({ email }) {
		if (passwordLoading) return;
		setPasswordLoading(true);
		try {
			await Post(1, "forgot_password", { email });
			localStorage.clear();
			toast.success("Reset Password Link sent to you email");
			history.replace("/login");
		} catch (error) {
			setPasswordLoading(false);
			toast.error(error?.response?.data?.message ?? "Something went Wrong");
		}
	}

	return (
		<Container component="main" maxWidth="xs">
			<MetaHelmet title="Forgot Password" />
			<CssBaseline />
			<div className={classes.paper}>
				<Typography variant="h1" sx={{ mb: 1 }}>
					Forgot Password
				</Typography>
				<Typography variant="subtitle2" sx={{ mb: 3, textAlign: "center" }}>
					Please enter the email address you'd like your password reset
					information sent to
				</Typography>
				<form
					className={classes.form}
					onSubmit={handleSubmit(handleResetPassword)}
				>
					<TextField
						{...register("email", {
							required: "Required",
							pattern: {
								value:
									/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
								message: "Please enter a valid email",
							},
						})}
						label="Email"
						type="email"
						error={errors?.email?.type}
						helperText={errors?.email?.message}
					/>

					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						className={classes.submit}
						disabled={passwordLoading}
						startIcon={
							passwordLoading ? (
								<CircularProgress color="secondary" size={20} />
							) : undefined
						}
					>
						Request Reset Link
					</Button>
				</form>
			</div>
		</Container>
	);
}
