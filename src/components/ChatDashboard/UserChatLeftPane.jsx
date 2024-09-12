import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import classNames from "classnames";
import React, { Suspense, lazy } from "react";
// import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
// import AnnouncementIcon from "@mui/icons-material/Announcement";
import RateReviewIcon from "@mui/icons-material/RateReview";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import Paper from "@mui/material/Paper";
import makeStyles from "@mui/styles/makeStyles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import styles from "./UserChatLeftPane.module.css";
import { SmallLoader } from "../common/NewLoader";
import { Tooltip } from "@mui/material";

const Users = lazy(() => import("./Users/Users"));
// const Unanswered = lazy(() => import("./Unanswered/Unanswered"));
// const Votes = lazy(() => import("./Votes/Votes"));
const Reviews = lazy(() => import("./Reviews/Reviews"));

const useStyles = makeStyles({
	root: {
		// flexGrow: 1,
		width: "100%",
		borderRadius: "8px",
	},
	tab: {
		minWidth: 0,
		padding: 0,
		width: 100,
	},
});

function UserChatLeftPane() {
	// const [open, setOpen] = useState(false);
	const classes = useStyles();
	const history = useHistory();
	const [value, setValue] = React.useState(
		Number(new URLSearchParams(window.location.search).get("tab")) ?? 0
	);

	const handleChange = (event, newValue) => {
		setValue(newValue);
		const url = new URL(window.location.href);
		url.searchParams.set("tab", newValue);
		history.replace(url.pathname + url.search);
	};

	return (
		<>
			<div className={classNames(styles.LeftChatContainer)}>
				<Paper
					// square
					className={classes.root}
					disablelevation="true"
					style={{
						boxShadow: "none",
					}}
				>
					<Tabs
						value={value}
						onChange={handleChange}
						variant="fullWidth"
						indicatorColor="primary"
						textColor="primary"
						aria-label="Chat Tabs"
					>
						<Tooltip title="View All Chats" arrow>
							<Tab
								classes={{
									root: classes.tab,
								}}
								icon={
									<QuestionAnswerIcon
										color={value === 0 ? "primary" : "inherit"}
									/>
								}
								label="Explore Chats"
							/>
						</Tooltip>
						{/* <Tooltip
							title="View questions that Chatbot was unable to answer"
							arrow
              >
							<Tab
              classes={{
                root: classes.tab,
								}}
								icon={
									<AnnouncementIcon
                  color={value === 1 ? "primary" : "inherit"}
									/>
                  }
                  label="UNANSWERED"
                  />
                  </Tooltip>
                  <Tooltip title="View answers upvoted/downvoted by users" arrow>
                  <Tab
                  classes={{
                    root: classes.tab,
                    }}
                    icon={
                      <ThumbsUpDownIcon
                      color={value === 2 ? "primary" : "inherit"}
                      />
                      }
                      label="VOTED"
                      />
                      </Tooltip> */}
						<Tooltip title="View Remarks" arrow>
							<Tab
								classes={{
									root: classes.tab,
								}}
								icon={
									<RateReviewIcon color={value === 1 ? "primary" : "inherit"} />
								}
								label="Remarks"
							/>
						</Tooltip>
					</Tabs>
				</Paper>

				<div className={classNames(styles.all_chats)}>
					<TabPanel value={value} index={0}>
						<Suspense fallback={<SmallLoader />}>
							<Users />
						</Suspense>
					</TabPanel>
					{/* <TabPanel value={value} index={1}>
						<Suspense fallback={<SmallLoader />}>
							<Unanswered />
						</Suspense>
					</TabPanel>
					<TabPanel value={value} index={2}>
						<Suspense fallback={<SmallLoader />}>
							<Votes />
						</Suspense>
					</TabPanel> */}
					<TabPanel value={value} index={1}>
						<Suspense fallback={<SmallLoader />}>
							<Reviews />
						</Suspense>
					</TabPanel>
				</div>
			</div>
		</>
	);
}

function TabPanel(props) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			style={{ height: "100%", overflowY: "scroll" }}
			hidden={value !== index}
			id={`a11y-tabpanel-${index}`} //Using a11y-tabpanel-0 as scrollable target for <Users /> infinite Scroll
			aria-labelledby={`a11y-tab-${index}`}
			{...other}
		>
			{value === index && <>{children}</>}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.number.isRequired,
	value: PropTypes.number.isRequired,
};

export default withErrorBoundary(UserChatLeftPane, "UserChatLeftPane");
