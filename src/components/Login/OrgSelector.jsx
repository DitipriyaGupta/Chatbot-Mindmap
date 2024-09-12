import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import { useHistory } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useOrgContext } from "context/OrgContext";
import { SmallLoader } from "components/common/NewLoader";

const useStyles = makeStyles((theme) => ({
	container: {
		display: "flex",
		width: "100%",
		flexDirection: "column",
		// height: "100%",
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		gap: 30,
	},
	content: {
		display: "grid",
		gridTemplateColumns: "1fr 1fr 1fr",
		gap: "12px",
		[theme.breakpoints.down("md")]: {
			gridTemplateColumns: "1fr 1fr",
		},
	},
}));
const OrgSelector = () => {
	const classes = useStyles();
	const { orgs } = useOrgContext();

	return (
		<div className={classes.container}>
			<Typography
				variant="h3"
				style={{
					textAlign: "center",
				}}
			>
				Which organization do you want to manage?
			</Typography>
			{orgs.length === 0 && <SmallLoader />}
			<div className={classes.content}>
				{orgs?.map((org, index) => {
					return <Org org={org} key={index} />;
				})}
				<Button
					component="a"
					href="https://docs.google.com/forms/d/e/1FAIpQLSfbOH9ImZsTmY7iegLf2bNr3JanIbpZBrKOQ6-em6Hexjae-A/viewform?usp=sf_link"
					target="_blank"
					fullWidth
					// variant="contained"
					color="secondary"
					startIcon={<AddCircleOutlineIcon />}
				>
					Add New Org
				</Button>
			</div>
		</div>
	);
};

const Org = ({ org }) => {
	const classes = useStyles();
	const history = useHistory();
	const { setOrg } = useOrgContext();

	const handleOrgSelection = () => {
		setOrg(org);
		history.push("/" + encodeURIComponent(org.host_url) + "/");
	};
	return (
		<Button
			className={classes.org}
			variant="outlined"
			color="primary"
			onClick={handleOrgSelection}
		>
			{org.name}
		</Button>
	);
};
export default withErrorBoundary(OrgSelector, "OrgSelector");
