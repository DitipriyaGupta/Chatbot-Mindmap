import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import makeStyles from "@mui/styles/makeStyles";
import Container from "@mui/material/Container";
import { CircularProgress } from "@mui/material";
import { useHistory } from "react-router-dom";
import MetaHelmet from "../common/MetaHelmet";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { SmallLoader } from "components/common/NewLoader";
import { useUserContext } from "context/UserContext";
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

export default function EmailVerification() {
	const { Post } = useApiCall();
	const classes = useStyles();
	const {
		register,
		handleSubmit,
		formState: { errors },
		reset: resetForm,
		watch,
	} = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});
	const { setUser } = useUserContext();
	const [isError, setIsError] = useState(false);
	const [loading, setLoading] = useState(true);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const history = useHistory();

	async function verifyToken() {
		const url = new URL(window.location.href);
		try {
			const response = await Post(0, `verify/${url.searchParams.get("token")}`);
			toast.success("Email Verified");
			if (Number(url.searchParams.get("password_updated"))) {
				resetForm();
				history.replace("/login");
			} else {
				setLoading(false);
				localStorage.setItem("access_token", response.data.data);
			}
		} catch (error) {
			setIsError(true);
			setLoading(false);
			if (error?.response?.data?.message)
				toast.error(error.response.data.message);
		}
	}
	useEffect(() => {
		localStorage.clear();
		setUser({});
		verifyToken();
	}, []);

	async function handleSetPassword({ password }) {
		if (passwordLoading) return;
		setPasswordLoading(true);
		try {
			await Post(1, "update_password", { password });
			localStorage.clear();
			toast.success("Password Updated Successfully");
			toast.success("Login to Continue");
			history.replace("/login");
		} catch (error) {
			setPasswordLoading(false);
			toast.error(error?.response?.data?.message ?? "Something went Wrong");
		}
	}

	if (loading) return <SmallLoader />;

	if (isError) return <h1>Email Verification Failed</h1>;

	return (
		<Container component="main" maxWidth="xs">
			<MetaHelmet title="Email Verification" />
			<CssBaseline />
			<div className={classes.paper}>
				<form
					className={classes.form}
					onSubmit={handleSubmit(handleSetPassword)}
				>
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
					<TextField
						{...register("confirmPassword", {
							required: "Required",
							minLength: {
								value: 6,
								message: "Password must be at least 6 letters long",
							},
							validate: (val) => {
								if (watch("password") !== val) {
									return "Your passwords do no match";
								}
							},
						})}
						label="Confirm Password"
						type="password"
						error={errors?.confirmPassword?.type}
						helperText={errors?.confirmPassword?.message}
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
						Set Password
					</Button>
				</form>
			</div>
		</Container>
	);
}
