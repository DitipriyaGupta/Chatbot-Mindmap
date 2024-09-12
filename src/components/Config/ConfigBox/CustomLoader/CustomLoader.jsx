import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import { Switch, TextField, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useRef } from "react";
//<div class="stage"><span class="dot_arousel"></span></div>

const CustomLoader = ({ loader, setLoader }) => {
	const [customLoaderView, setCustomLoaderView] = React.useState(!!loader);
	const loaderRef = useRef(null);

	return (
		<>
			<div className="configItem">
				<label
					htmlFor="customLoader"
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: "6px",
					}}
				>
					Custom Loader
					<Tooltip
						title={
							"Add a custom loader to your chatbot. You can add a gif or a video."
						}
					>
						<InfoIcon fontSize="small" color="primary" />
					</Tooltip>
				</label>
				<Switch
					id="customLoader"
					//   value={showBubble}
					checked={customLoaderView}
					color="primary"
					onChange={(e) => {
						setCustomLoaderView(e.target.checked);
						if (e.target.checked)
							loaderRef.current.scrollIntoView({
								behavior: "smooth",
							});
						if (!e.target.checked) {
							setLoader("");
						}
					}}
				/>
			</div>

			<div
				ref={loaderRef}
				style={{
					display: customLoaderView ? "flex" : "none",
					justifyContent: "flex-start",
					alignSelf: "flex-start",
				}}
			>
				<TextField
					label="Loader link"
					value={loader}
					onChange={(e) => setLoader(e.target.value)}
					helperText="Add a link of your loader gif/image. Max height of image can be 35px"
				/>
			</div>
		</>
	);
};

export default withErrorBoundary(CustomLoader, "CustomLoader");
