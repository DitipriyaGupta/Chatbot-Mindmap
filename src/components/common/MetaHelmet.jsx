import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import { Helmet } from "react-helmet";

const MetaHelmet = ({ title, description }) => {
	if (!title) return <></>;
	return (
		<Helmet>
			<title>{String(title)}</title>
			<meta name="description" content={String(description)} />
			<meta property="og:title" content={String(title)} />
			<meta property="og:description" content={String(description)} />
			<meta name="twitter:title" content={String(title)} />
			<meta name="twitter:description" content={String(description)} />
		</Helmet>
	);
};
export default withErrorBoundary(MetaHelmet, "MetaHelmet");
