import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import { CircularProgress, Link as MuiLink } from "@mui/material";
import { useHistory, Link, useLocation } from "react-router-dom";
import MetaHelmet from "../common/MetaHelmet";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useUserContext } from "context/UserContext";
import { useApiCall } from "components/common/appHooks.js";

function Copyright() {
	return (
		<Typography variant="body2" color="textSecondary" align="center">
			{"Copyright © "}
			<MuiLink
				color="inherit"
				href="https://www.beyondchats.com"
				underline="hover"
			>
				BeyondChats
			</MuiLink>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}

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
		marginTop: theme.spacing(1),
		width: "100%",
		display: "flex",
		gap: 10,
		flexDirection: "column",
	},
	forgotPassword: {
		display: "block",
		textAlign: "end",
		textDecoration: "underline",
		width: "100%",
	},
}));

export default function SignIn() {
	const { Post } = useApiCall();
	const classes = useStyles();
	const {
		user: { access_token },
		setUser,
	} = useUserContext();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues: {
			password: "",
			email: "",
		},
	});
	const [loading, setLoading] = useState(false);
	const history = useHistory();
	const location = useLocation();

	async function handleLogin({ email, password }) {
		setLoading(true);

		try {
			const data = new FormData();
			data.append("email", email);
			data.append("password", password);
			const response = await Post(0, "login", data);
			localStorage.setItem("user_name", response.data.data.name);
			localStorage.setItem("user_email", response.data.data.email);
			localStorage.setItem("access_token", response.data.data.access_token);
			localStorage.setItem("refresh_token", response.data.data.refresh_token);
			setUser(response.data.data);
			history.push(
				location?.state?.from?.pathname
					? `${location?.state?.from?.pathname}${location?.state?.from?.search}`
					: "/organization"
			);
		} catch (error) {
			console.error(error);
			setLoading(false);
			toast.error(
				error?.response?.data?.message ?? "Invalid Email or Password"
			);
		}
	}

	if (access_token) {
		history.push("/organization");
	}

	return (
		<Container component="main" maxWidth="xs">
			<MetaHelmet title="Login" />
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}>
					<LockOutlinedIcon />
				</Avatar>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>
				<form className={classes.form}>
					<TextField
						{...register("email", {
							required: "Required",
							pattern: {
								value: /\S+@\S+\.\S+/,
								message: "Must be a valid Email",
							},
						})}
						type="email"
						label="Email"
						error={errors?.email?.type}
						helperText={errors?.email?.message}
					/>
					<TextField
						{...register("password", {
							required: "Required",
							minLength: {
								value: 6,
								message: "Password must be at least 6 letters long",
							},
						})}
						label="Password"
						type="password"
						error={errors?.password?.type}
						helperText={errors?.password?.message}
					/>
					<Link className={classes.forgotPassword} to="/forgot-password">
						<Typography variant="subtitle2">Forgot Password?</Typography>
					</Link>

					<Button
						onClick={handleSubmit(handleLogin)}
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						disabled={loading}
						startIcon={
							loading ? (
								<CircularProgress color="secondary" size={20} />
							) : undefined
						}
					>
						Sign In
					</Button>
					<Button
						component="a"
						href="https://docs.google.com/forms/d/e/1FAIpQLSfbOH9ImZsTmY7iegLf2bNr3JanIbpZBrKOQ6-em6Hexjae-A/viewform?usp=sf_link"
						target="_blank"
						fullWidth
						variant="outlined"
						color="secondary"
						// className={classes.submit}
						// disabled
					>
						Grab your own chatbot
					</Button>
				</form>
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	);
}
