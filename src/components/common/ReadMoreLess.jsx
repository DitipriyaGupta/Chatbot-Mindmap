import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import { Box, Button, Collapse } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const ReadMoreLess = ({ children, height = 100 }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [isOverflowing, setIsOverflowing] = useState(true);
	const contentRef = useRef(null);

	useEffect(() => {
		if (contentRef.current) {
			setIsOverflowing(contentRef.current.scrollHeight > height);
		}
	}, [height, children]);

	const handleToggle = () => {
		setIsExpanded(!isExpanded);
	};

	return (
		<>
			{isOverflowing ? (
				<Box component="div">
					<Collapse in={isExpanded} collapsedSize={height}>
						<Box
							ref={contentRef}
							sx={{
								overflow: "hidden",
								height: "auto",
								transition: "height 0.3s ease",
								whiteSpaceCollapse: "preserve",
							}}
						>
							{children}
						</Box>
					</Collapse>
					<Button
						variant="text"
						onClick={handleToggle}
						endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
					>
						{isExpanded ? "Show less" : "Show more"}
					</Button>
				</Box>
			) : (
				<Box component="div">{children}</Box>
			)}
		</>
	);
};

export default withErrorBoundary(ReadMoreLess, "ReadMoreLess");
