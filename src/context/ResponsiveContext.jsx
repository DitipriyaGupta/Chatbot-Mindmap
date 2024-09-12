import { useTheme } from "@emotion/react";
import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

const ResponsiveContext = React.createContext();

export const ResponsiveProvider = ({ children }) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

	return (
		<ResponsiveContext.Provider value={{ isMobile }}>
			{children}
		</ResponsiveContext.Provider>
	);
};

export const useResponsiveContext = () => {
	return React.useContext(ResponsiveContext);
};
