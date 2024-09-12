import React from "react";
import { createRoot } from "react-dom/client";
import Routes from "./components/routes.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import {
	createTheme,
	ThemeProvider,
	StyledEngineProvider,
} from "@mui/material/styles";
import { UserProvider } from "context/UserContext.jsx";
import ErrorBoundary from "components/ErrorBoundary/ErrorBoundary.jsx";
import { OrgProvider } from "context/OrgContext.jsx";
import { PlanProvider } from "context/PlanContext.jsx";
import { NotificationChannelProvider } from "context/NotificationContext.jsx";
import { ResponsiveProvider } from "context/ResponsiveContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./toast.css";

const theme = createTheme({
	components: {
		MuiTooltip: {
			defaultProps: {
				arrow: true,
				PopperProps: {
					modifiers: [
						// {
						// 	name: "offset",
						// 	options: {
						// 		offset: [0, 10], // Adjust the offset as needed
						// 	},
						// },
						{
							name: "preventOverflow",
							options: {
								boundary: "viewport",
								padding: 20, // Adjust the padding as needed
							},
						},
					],
				},
			},
		},
		MuiButton: {
			defaultProps: {
				variant: "contained",
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined",
			},
		},
	},
	typography: {
		fontFamily: `"Poppins", sans-serif`,
		h1: {
			fontWeight: 600,
			fontSize: "3rem",
			"@media (max-width:1920px)": {
				fontSize: "2.0243rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "1.6025rem",
			},
			"@media (max-width:960px)": {
				fontSize: "1.282rem",
			},
			"@media (max-width:600px)": {
				fontSize: "1.2rem",
			},
		},
		h2: {
			fontSize: "2.5rem",
			fontWeight: 500,
			"@media (max-width:1920px)": {
				fontSize: "2rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "1.5625rem",
			},
			"@media (max-width:960px)": {
				fontSize: "1.25rem",
			},
			"@media (max-width:600px)": {
				fontSize: "1.1rem",
			},
		},
		h3: {
			fontSize: "1.75rem",
			fontWeight: 500,
			"@media (max-width:1920px)": {
				fontSize: "1.5rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "1.1719rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.9375rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.9rem",
			},
		},
		h4: {
			fontWeight: 400,
			fontSize: "1.5rem",
			"@media (max-width:1920px)": {
				fontSize: "1.25rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.9766rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.7813rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.75rem",
			},
		},
		h5: {
			fontSize: "1.25rem",
			"@media (max-width:1920px)": {
				fontSize: "1.125rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.8789rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.7031rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.675rem",
			},
		},
		h6: {
			fontSize: "1.125rem",
			"@media (max-width:1920px)": {
				fontSize: "1rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.7813rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.625rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.6rem",
			},
		},
		subtitle1: {
			fontSize: "1.125rem",
			"@media (max-width:1920px)": {
				fontSize: "1rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.7813rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.675rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.6rem",
			},
		},
		subtitle2: {
			fontSize: "1rem",
			"@media (max-width:1920px)": {
				fontSize: "0.7813rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.625rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.6rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.5rem",
			},
		},
		body1: {
			fontSize: "1.25rem",
			"@media (max-width:1920px)": {
				fontSize: "1.125rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "1rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.95rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.8789rem",
			},
		},
		body2: {
			fontSize: "1.125rem",
			"@media (max-width:1920px)": {
				fontSize: "1rem",
			},
			"@media (max-width:1280px)": {
				fontSize: "0.7813rem",
			},
			"@media (max-width:960px)": {
				fontSize: "0.625rem",
			},
			"@media (max-width:600px)": {
				fontSize: "0.6rem",
			},
		},
	},
	palette: {
		primary: {
			dark: "#333bc7",
			main: "#2872FA",
			light: "#e3f2ff",
		},
		secondary: {
			dark: "#98004c",
			main: "#fa2871",
			light: "#ffe3eb",
		},
	},
});

const root = createRoot(document.getElementById("root"));

root.render(
	<BrowserRouter>
		<Provider store={store}>
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={theme}>
					<UserProvider>
						<OrgProvider>
							<PlanProvider>
								<NotificationChannelProvider>
									<ResponsiveProvider>
										<ErrorBoundary component="routes">
											<Routes />
										</ErrorBoundary>
									</ResponsiveProvider>
								</NotificationChannelProvider>
							</PlanProvider>
						</OrgProvider>
					</UserProvider>
				</ThemeProvider>
			</StyledEngineProvider>
		</Provider>
		<ToastContainer
			position="bottom-right"
			autoClose={5000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="colored"
		/>
	</BrowserRouter>
);
