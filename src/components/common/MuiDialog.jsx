import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Dialog from "@mui/material/Dialog";
import PropTypes from "prop-types";

const useStyles = makeStyles((theme) => ({
	paper: {
		borderRadius: "16px",
		width: (props) => props.width,
		padding: "5px",
	},
	dialogTitle: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		fontSize: "18px",
		fontWeight: 500,
		paddingRight: "5px",
		paddingBottom: "0",
		[theme.breakpoints.down("sm")]: {
			fontSize: "16px",
		},
	},
}));
const MuiDialog = ({
	open,
	onClose,
	title,
	children,
	onSubmit,
	submitDisabled,
	disableButtons = false,
	submitButtonText = "Submit",
	cancelButtonText = "Cancel",
	width = "730px",
	containerClass = "",
}) => {
	const classes = useStyles({ width });

	return (
		<Dialog
			open={open}
			onClose={onClose}
			classes={{ paper: classes.paper }}
			maxWidth="lg"
			aria-labelledby="common-dialog-title"
			aria-describedby="common-dialog-description"
			disableEnforceFocus
		>
			<DialogTitle id="common-dialog-title" className={classes.dialogTitle}>
				{title}
				<IconButton onClick={onClose} size="large">
					<CloseRoundedIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent
				id="common-dialog-description"
				className={containerClass}
				dividers
			>
				{children}
			</DialogContent>
			{!disableButtons ? (
				<DialogActions>
					<Button onClick={onClose} color="secondary" variant="outlined">
						{cancelButtonText}
					</Button>
					{onSubmit ? (
						<Button
							onClick={onSubmit}
							color="primary"
							disabled={submitDisabled}
						>
							{submitButtonText}
						</Button>
					) : null}
				</DialogActions>
			) : null}
		</Dialog>
	);
};

MuiDialog.propTypes = {
	open: PropTypes.any.isRequired,
	onClose: PropTypes.any.isRequired,
	title: PropTypes.any.isRequired,
	children: PropTypes.any.isRequired,
	onSubmit: PropTypes.any,
	submitDisabled: PropTypes.any,
	disableButtons: PropTypes.any,
	submitButtonText: PropTypes.any,
	cancelButtonText: PropTypes.any,
	width: PropTypes.string,
};

export default withErrorBoundary(MuiDialog, "MuiDialog");
