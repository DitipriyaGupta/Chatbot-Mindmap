import React, { useEffect, useState } from "react";
import { useApiCall } from "components/common/appHooks";
import { SmallLoader } from "components/common/NewLoader";
import { REQUEST_CANCELED_MESSAGE } from "components/common/constants";
import axios from "axios";

const Telescope = () => {
	const axiosCancelSource = axios.CancelToken.source();
	const { Get } = useApiCall();
	const [iframeSrc, setIframeSrc] = useState("");

	async function getAnalytics() {
		try {
			const { data } = await Get(
				1,
				"telescope",
				undefined,
				axiosCancelSource.token
			);
			const blob = new Blob([data], { type: "text/html" });
			const url = URL.createObjectURL(blob);
			setIframeSrc(url);
		} catch (error) {
			console.error("Error fetching telescope data:", error);
		}
	}

	useEffect(() => {
		getAnalytics();

		return () => {
			if (iframeSrc) URL.revokeObjectURL(iframeSrc);
			axiosCancelSource.cancel(REQUEST_CANCELED_MESSAGE);
		};
	}, []);

	return (
		<div style={{ height: "100%", width: "100%" }}>
			{iframeSrc ? (
				<iframe
					src={iframeSrc}
					title="Telescope"
					width="100%"
					height="100%"
					style={{ border: "none" }}
				/>
			) : (
				<SmallLoader />
			)}
		</div>
	);
};

export default Telescope;
