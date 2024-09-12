import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Switch,
	Route,
	Redirect,
	matchPath,
	useHistory,
} from "react-router-dom";
import MultilineChartIcon from "@mui/icons-material/MultilineChart";
import InsightsIcon from "@mui/icons-material/Insights";
import PaymentIcon from "@mui/icons-material/Payment";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
// import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import TableChartIcon from "@mui/icons-material/TableChart";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import NewLoader from "./common/NewLoader";
import GroupsIcon from "@mui/icons-material/Groups";
import LogoDevIcon from "@mui/icons-material/LogoDev";
import BusinessIcon from "@mui/icons-material/Business";
import "@sweetalert2/theme-material-ui/material-ui.css";
import "../assets/css/common/default.css";
import { Backdrop, Typography } from "@mui/material";
import { useMemo } from "react";
import Loader from "./common/NewLoader";
import { useUserContext } from "context/UserContext.jsx";
import { STATUS } from "react-joyride";
import { useOrgContext } from "context/OrgContext.jsx";
import { useResponsiveContext } from "context/ResponsiveContext.jsx";
import { useApiCall } from "./common/appHooks.js";
import notificationPermission from "./common/notificationPermission";
import { getMessaging, onMessage } from "firebase/messaging";
import firebase from "./common/firebase";

const ReactJoyride = lazy(() => import("react-joyride"));
const MindMap = lazy(() => import("./MindMap/MindMap.jsx"));
const LeftDrawer = lazy(() => import("./LeftDrawer/LeftDrawer.jsx"));
const ChatDashboard = lazy(() => import("./ChatDashboard/ChatDashboard"));
const OrgSelector = lazy(() => import("./Login/OrgSelector.jsx"));
const Config = lazy(() => import("./Config/Config.jsx"));
const Navbar = lazy(() => import("./Navbar/NavBar.jsx"));
const SignIn = lazy(() => import("./Login/SignIn"));
const EmailVerification = lazy(() => import("./Login/EmailVerification"));
const ForgotPassword = lazy(() => import("./Login/ForgotPassword"));
const LeadsData = lazy(() => import("./LeadsData/LeadsData"));
const TeamManagement = lazy(
	() => import("./TeamManagement/TeamManagement.jsx")
);
const Analytics = lazy(() => import("./Analytics/Analytics"));
const Billing = lazy(() => import("./Billing/Billing"));

// God Components
const CreateNewOrg = lazy(() => import("./God/CreateNewOrg.jsx"));
const GodExplorer = lazy(() => import("./God/GodExplorer.jsx"));
const EditOrg = lazy(() => import("./God/EditOrg.jsx"));
const MessageSandbox = lazy(() => import("./God/MessageSandbox.jsx"));
const DeleteOrg = lazy(() => import("./God/DeleteOrg.jsx"));
const ClearOrgChats = lazy(() => import("./God/ClearOrgChats.jsx"));
const DuplicateOrg = lazy(() => import("./God/DuplicateOrg.jsx"));
const SyncOrgVectors = lazy(() => import("./God/SyncOrgVectors.jsx"));
const SyncAllOrgVectors = lazy(() => import("./God/SyncAllOrgVectors.jsx"));
const Telescope = lazy(() => import("./God/Telescope"));

function AppRoutes() {
	const history = useHistory();
	const { Post, trackOnDashboard } = useApiCall();
	const {
		user: { access_token },
		setUser,
	} = useUserContext();
	const notificationRef = useRef(null);
	const [showStartTutorial, setShowStartTutorial] = useState(() => {
		const searchParams = new URLSearchParams(history.location.search);
		return searchParams.get("guide") === "true";
	});
	const [isOpened, setIsOpened] = useState(false);
	const [isBackdropOpen, setIsBackdropOpen] = useState(false);
	const { org } = useOrgContext();
	const { isMobile } = useResponsiveContext();

	const handleLogout = useCallback(async () => {
		setIsBackdropOpen(true);
		try {
			await Post(1, "logout");
		} catch (error) {
			console.error(error);
		}
		localStorage.clear();
		setUser({});
		history.push("/login");
		setIsBackdropOpen(false);
		window.location.reload();
	}, [history, Post]);

	const navOptions = useMemo(
		() => [
			{
				title: "Explore Chats",
				Icon: InboxIcon,
				onClick: () => history.push("/"),
				tourHeading: "User Chats",
				explanation: "Conversations of your website visitors are shown here",
				isActive: !!matchPath(history.location.pathname, {
					path: "/:org/:chatId(\\d+)",
					exact: true,
					strict: true,
				}),
			},
			...(isMobile
				? [
						{
							title: "Switch Organization",
							Icon: BusinessIcon,
							onClick: () => history.push(`/organization`),
							tourHeading: "Switch Organization",
							explanation:
								"Use this option to switch between different organizations if you belong to multiple organizations. It helps you manage your interactions and data within different contexts.",
							isActive: history.location.pathname === "/organization",
						},
					]
				: []),

			{
				title: "Business Leads",
				Icon: ContactPhoneIcon,
				onClick: () =>
					history.push(`/${encodeURIComponent(org.host_url)}/leads`),
				tourHeading: "Leads for you",
				explanation:
					"Data of users who have shown interest in your products/services and have shared their contact details",
				isActive: !!matchPath(history.location.pathname, "/:org/leads"),
			},

			{
				title: "View Mind Map",
				Icon: TableChartIcon,
				onClick: () =>
					history.push(`/${encodeURIComponent(org.host_url)}/mind-map`),
				tourHeading: "Chatbot Mind Map",
				explanation:
					"This is the brain and the memory of the chatbot. You can add, edit and analyse the source data being used to answer user queries from here",
				isActive: !!matchPath(history.location.pathname, "/:org/mind-map"),
			},
			{
				title: "Manage Team",
				Icon: GroupsIcon,
				onClick: () =>
					history.push(`/${encodeURIComponent(org.host_url)}/team`),
				tourHeading: "Manage your Team",
				explanation: "View team, Add new members, remove members, etc",
				isActive: !!matchPath(history.location.pathname, "/:org/team"),
			},
			{
				title: "Configure Chatbot",
				Icon: SettingsIcon,
				onClick: () =>
					history.push(`/${encodeURIComponent(org.host_url)}/config`),
				tourHeading: "Personalize the chatbot",
				explanation:
					"Customize the look & feel of the chatbot: colors, personality, chatbot name, logo, business actions, and much more!",
				isActive: !!matchPath(history.location.pathname, "/:org/config"),
			},
			// {
			// 	title: "Logout",
			// 	Icon: ExitToAppIcon,
			// 	onClick: "",
			// 	tourHeading: "Logout",
			// 	explanation: "Log out securely and end your current session.",
			// 	isActive: false,
			// },
		],
		[
			history,
			history.location.pathname,
			org.host_url,
			handleLogout,
			isMobile,
		]
	);

	const tourSteps = useMemo(
		() => [
			{
				content: (
					<div>
						<Typography variant="h3">
							Welcome to BeyondChats Guided Tour!
						</Typography>
						<br />
						<Typography variant="body1">
							his tour will help you understand all the functionalities of
							BeyondChats admin dashboard Click the 'Start Tour' button below to
							start the tour!
						</Typography>
					</div>
				),
				locale: { next: "Start Tour" },
				placement: "center",
				target: "body",
			},
			...navOptions.map((option, index) => {
				return {
					target: `.nav-option-${index}`, // Add a unique class to each navigation option element
					content: (
						<div>
							<Typography variant="h3">{option.tourHeading}</Typography>
							<br />
							<Typography variant="body1">{option.explanation}</Typography>
						</div>
					),
					placement: "right", // Adjust the placement as needed
				};
			}),
		],
		[navOptions]
	);

	const toggleLeftNav = (set) => {
		setIsOpened((prev) => (typeof set === "boolean" ? set : !prev));
	};

	useEffect(() => {
		if (access_token) {
			const handleVisibilityChange = () => {
				if (!document.hidden && notificationRef.current) {
					notificationRef.current.close();
					notificationRef.current = null;
				}
			};
			try {
				notificationPermission()
					.then((res) => {
						if (res === true)
							trackOnDashboard({ message: "Notification Permission Granted" });
					})
					.catch(console.error)
					.finally(() => {
						try {
							if (Notification.permission === "granted") {
								const messaging = getMessaging(firebase);
								onMessage(messaging, (payload) => {
									if (document.hidden) {
										console.log(payload);
										notificationRef.current = new Notification(
											payload.notification.title,
											{
												body: payload.notification.body,
												icon: "/favicon.png",
											}
										);
									}
								});
							}
						} catch (error) {
							console.error(error);
						}
					});
			} catch (error) {
				console.error(error);
			}
			document.addEventListener("visibilitychange", handleVisibilityChange);

			return () => {
				document.removeEventListener(
					"visibilitychange",
					handleVisibilityChange
				);
			};
		}
	}, [access_token]);

	return (
		<Suspense fallback={<NewLoader firstPage={true} name="routes" />}>
			<Backdrop
				open={isBackdropOpen}
				sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
			>
				<Loader name="BackDrop" />
			</Backdrop>
			<Switch>
				<Route path="/">
					<Navbar
						navOptions={navOptions}
						setShowStartTutorial={setShowStartTutorial}
						toggleLeftNav={toggleLeftNav}
					/>
					<Suspense fallback={<NewLoader firstPage={true} name="routes" />}>
						<Switch>
							<Route exact path="/login" component={SignIn} />
							<Route
								exact
								path="/email-verification"
								component={EmailVerification}
							/>
							<Route exact path="/forgot-password" component={ForgotPassword} />
							{access_token && (
								<>
									<LeftDrawer {...{ isOpened, toggleLeftNav, navOptions }} />
									<Suspense fallback={<></>}>
										{showStartTutorial ? (
											<ReactJoyride
												continuous
												run={!!showStartTutorial}
												scrollToFirstStep
												showProgress
												showSkipButton
												steps={tourSteps}
												disableCloseOnEsc
												hideCloseButton
												disableOverlayClose
												styles={{
													options: {
														primaryColor: "var(--primary)",
														width: 600,
														zIndex: 10000,
													},
												}}
												callback={(data) => {
													const { status } = data;
													if (
														[STATUS.FINISHED, STATUS.SKIPPED].includes(status)
													) {
														setShowStartTutorial(false);
														const url = new URL(window.location.href);
														url.searchParams.delete("guide");
														history.replace(url.pathname + url.search);
													}
												}}
											/>
										) : null}
									</Suspense>
									{/* 100vw - width of small left drawer, also see Nav CSS */}
									<div
										style={{
											width: isMobile ? "100vw" : "calc(100vw - 64px)",
											height: isMobile
												? "calc(100dvh - 58px)"
												: "calc(100dvh - 65px)",
											position: "absolute",
											right: 0,
										}}
									>
										<Suspense
											fallback={<NewLoader firstPage={true} name="routes" />}
										>
											<Switch>
												<Route
													exact
													path="/organization"
													component={OrgSelector}
												/>
												<Route path="/:org">
													<Switch>
														<Route
															exact
															path="/:org/config"
															component={Config}
														/>
														<Route
															exact
															path="/:org/leads"
															component={LeadsData}
														/>
														<Route
															exact
															path="/:org/mind-map"
															component={MindMap}
														/>
														<Route
															exact
															path="/:org/team"
															component={TeamManagement}
														/>
														<Route
															exact
															path="/:org/analytics"
															component={Analytics}
														/>
														<Route
															exact
															path="/:org/billing"
															component={Billing}
														/>
														<Route
															exact
															path="/:org/:chatId?"
															component={ChatDashboard}
														/>
														<Route
															exact
															path="/:org/:name?/:chatId?"
															component={ChatDashboard}
														/>
													</Switch>
												</Route>
											</Switch>
										</Suspense>
									</div>
								</>
							)}
							<Route exact path="/signin">
								<Redirect to="/login" />
							</Route>
							<Route path="/*">
								<Redirect
									to={{
										pathname:
											access_token && org.host_url
												? `/${org.host_url}/`
												: "/login",
										state: access_token
											? undefined
											: { from: history.location },
									}}
								/>
							</Route>
							<Route>
								<Redirect to="/login" />
							</Route>
						</Switch>
					</Suspense>
					<Route exact path="/">
						<Redirect to={`/${org.host_url}/`} />
					</Route>
				</Route>
			</Switch>
		</Suspense>
	);
}

export default withErrorBoundary(AppRoutes, "AppRoutes");
