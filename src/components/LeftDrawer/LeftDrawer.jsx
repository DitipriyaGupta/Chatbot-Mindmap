import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Tooltip, styled } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import MuiDrawer from "@mui/material/Drawer";

const DrawerHeader = styled("div")(({ theme }) => ({
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
}));

const drawerWidth = 270;
const openedMixin = (theme) => ({
	width: drawerWidth,
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.enteringScreen,
	}),
	overflowX: "hidden",
});

const closedMixin = (theme) => ({
	transition: theme.transitions.create("width", {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	overflowX: "hidden",
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up("sm")]: {
		width: `calc(${theme.spacing(8)} + 1px)`,
	},
	[theme.breakpoints.down("sm")]: {
		width: `0px`,
	},
});
const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: "nowrap",
	boxSizing: "border-box",
	...(open && {
		...openedMixin(theme),
		"& .MuiDrawer-paper": openedMixin(theme),
	}),
	...(!open && {
		...closedMixin(theme),
		"& .MuiDrawer-paper": closedMixin(theme),
	}),
}));

const LeftDrawer = ({ isOpened, toggleLeftNav, navOptions }) => {
	return (
		<Drawer
			variant="permanent"
			anchor="left"
			open={isOpened}
			onClose={toggleLeftNav}
		>
			<Tooltip
				title={isOpened ? "Close Left Drawer" : "Open Left Drawer"}
				arrow
			>
				<DrawerHeader>
					<IconButton onClick={toggleLeftNav}>
						{isOpened ? <ChevronLeftIcon /> : <MenuIcon />}
					</IconButton>
				</DrawerHeader>
			</Tooltip>
			<Divider />
			<List>
				{navOptions.map(({ title, Icon, onClick, isActive }, index) => (
					<Tooltip
						title={isOpened ? "" : title}
						arrow
						placement="right"
						key={title}
					>
						<ListItem
							disablePadding
							sx={{
								display: "block",
								backgroundColor: isActive ? "primary.light" : undefined,
							}}
							className={`nav-option-${index}`}
						>
							<ListItemButton
								onClick={() => {
									toggleLeftNav(false);
									onClick();
								}}
								sx={{
									minHeight: 48,
									justifyContent: isOpened ? "initial" : "center",
									px: 2.5,
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 0,
										mr: isOpened ? 3 : "auto",
										justifyContent: "center",
									}}
								>
									<Icon color={isActive ? "primary" : undefined} />
								</ListItemIcon>
								<ListItemText
									primary={title}
									// sx={{ display: isOpened ? "block" : "none" }}
									sx={{ opacity: isOpened ? 1 : 0 }}
								/>
							</ListItemButton>
						</ListItem>
					</Tooltip>
				))}
			</List>
		</Drawer>
	);
};

export default withErrorBoundary(LeftDrawer, "LeftDrawer");
