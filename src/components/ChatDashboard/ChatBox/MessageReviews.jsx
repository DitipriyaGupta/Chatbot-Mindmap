import React from "react";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import { REVIEW_UNRESOLVED, UPVOTE } from "components/common/constants";
import { Box, Chip, Tooltip, Typography } from "@mui/material";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { useApiCall } from "components/common/appHooks";
import { CircleCheckBig, Clock8 } from "lucide-react";
import { useChatConfigContext } from "components/Config/ChatConfigContext/ChatConfigContext";

const MessageReviews = ({ reviews,setReviewBox, setReviews }) => {
	const {
		chatConfig: { themeBackground},
	} = useChatConfigContext();
	const { Post } = useApiCall();
	async function toggleResolved(review_id) {
		const response = await Post(
			1,
			"review/resolved",
			{ review_id },
			undefined,
			{ showProgress: false }
		);
		setReviews((prev) =>
			prev.map((prevReview) =>
				prevReview.id === review_id ? response.data.data : prevReview
			)
		);
	}

	function handleLabelClick(review) {		
		if (review.review_status === REVIEW_UNRESOLVED && !review?.remark) {
			setReviewBox(true);
		} else {
			setReviewBox(false);
		}
	}

	return (
		<Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
			{reviews.map((review) => (
				<Chip
				  sx={{backgroundColor:'white',height:'28px',marginTop:'-4px',maxWidth:'300px'}}
					icon={
						<Tooltip
							title={
								<>
									<Typography variant="subtitle2">
										Remark by: {review.remarker?.name ?? "BeyondChat"}
									</Typography>
									{review.vote !== UPVOTE&&<><Typography variant="subtitle2">
										Status{": "}
										{review.review_status === REVIEW_UNRESOLVED
											? "Pending"
											: "Resolved"}
									</Typography>
									{review.resolved_by&& (
										<Typography variant="subtitle2">
											Resolved by: {review.resolver?.name ?? "BeyondChat"}
										</Typography>
									)}</>}
								</>
							}
						>
							{review.vote === UPVOTE ? (
								<ThumbUpAltIcon style={{color:themeBackground}} fontSize="small" />
							) : (
								<ThumbDownAltIcon color="secondary" fontSize="small" />
							)}
						</Tooltip>
					}
					label={review.vote === UPVOTE ?'':review?.remark?
						<Tooltip title={review?.remark}>
						{review?.remark}</Tooltip>:"No Remark"}
					deleteIcon={
						review.review_status === REVIEW_UNRESOLVED ? (
							<Tooltip title="Mark Resolved">
								<Clock8 size={16} style={{ minWidth: "16px", minHeight: "16px" }} color="#FFC107" />
							</Tooltip>
						) : (
							<Tooltip
								title={review.vote !== UPVOTE?`Resolved by ${review.resolver?.name ?? "BeyondChat"}`:null}
							>
								<CircleCheckBig size={15} color="green" />
							</Tooltip>
						)
					}
					variant="outlined"
					onDelete={() => {
						if (review.review_status === REVIEW_UNRESOLVED)
							toggleResolved(review.id);
					}}
					onClick={() => handleLabelClick(review)}
				/>
			))}
		</Box>
	);
};

export default withErrorBoundary(MessageReviews, "MessageReviews");
