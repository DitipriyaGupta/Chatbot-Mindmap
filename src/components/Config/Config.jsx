import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import PreviewBox from "./PreviewBox";
import EditConfig from "./ConfigBox/EditConfig";
import styles from "./Config.module.css";
import "./ConfigCommon.css";
import Split from "react-split";
import { ChatConfigProvider } from "./ChatConfigContext/ChatConfigContext";

const Admin = () => {
	return (
		<ChatConfigProvider>
			<div className={styles.adminArea}>
				<Split className="split" sizes={[50, 50]}>
					<EditConfig />
					<div
						style={{
							position: "relative",
						}}
					>
						<PreviewBox />
					</div>
				</Split>
			</div>
		</ChatConfigProvider>
	);
};

export default withErrorBoundary(Admin, "Admin");
