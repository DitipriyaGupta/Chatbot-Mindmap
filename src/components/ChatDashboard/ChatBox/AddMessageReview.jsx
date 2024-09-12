import React, { useEffect, useState } from "react";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import styles from "./AddMessageReview.module.css";
import {
	Box,
	Button,
	TextField,
	Chip,
	Divider,
	Grow,
	Collapse,
} from "@mui/material";
import { useApiCall } from "components/common/appHooks";
import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary";
import { Send, X } from "lucide-react";
import { UPVOTE, DOWNVOTE } from "components/common/constants";
import { useTheme } from "@mui/styles";

const AddMessageReview = ({
	message_id,
	reviewBox,
	setReviewBox,
	reviews,
	setReviews,
}) => {
	const { Post } = useApiCall();
	const theme = useTheme();
	const [selectedChips, setSelectedChips] = useState([]);
	const [additionalFeedback, setAdditionalFeedback] = useState("");
	const [review, setReview] = useState({});
	const [loading, setLoading] = useState(false);
	const [unRemarked, setUnRemarked] = useState(false);
	const [currVote, setCurrVote] = useState(-1);

	async function resetReview() {
		setAdditionalFeedback("");
		setSelectedChips([]);
		setLoading(false);
		setCurrVote(-1);
	}

	useEffect(() => {
		const relevantReviews = reviews.filter(
			(review) => review.message_id === message_id && !review.resolved_by
		);
		if (relevantReviews.length > 0) {
			setReview(relevantReviews[relevantReviews.length - 1]);
			setCurrVote(relevantReviews[relevantReviews.length - 1].vote);
			const lastReview = relevantReviews[relevantReviews.length - 1];
			const hasUnRemarked =
				lastReview.vote === DOWNVOTE &&
				(!lastReview.remark || lastReview.remark.trim() === "");
			setUnRemarked(hasUnRemarked);
		} else {
			setReview(undefined);
			setUnRemarked(false);
		}
	}, [reviews, message_id]);

	async function updateReview(vote, remark, buttonSubmit) {
		try {
			setLoading(true);
			const response = await Post(
				1,
				"review/update",
				{
					vote,
					remark: remark || review?.remark,
					review_id: review?.id,
				},
				undefined,
				{ showProgress: false }
			);
			if (buttonSubmit) {
				resetReview();
			}
			setReviews((prev) =>
				prev.map((prevReview) =>
					prevReview.id === review?.id ? response.data.data : prevReview
				)
			);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
			if (buttonSubmit) {
				setReviewBox(false);
			}
		}
	}

	async function addVote(vote) {
		try {
			setLoading(true);
			const response = await Post(
				1,
				"review/mark",
				{ message_id, vote },
				undefined,
				{ showProgress: false }
			);
			setReviews((prev) => [...prev, response.data.data]);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
		if (vote === DOWNVOTE) {
			setReviewBox(true);
		}
	}

	async function deleteVote() {
		if (!review || !review.id) return;
		try {
			await Post(1, "review/delete", { review_id: review?.id }, undefined, {
				showProgress: false,
			});
			setReviews((prev) =>
				prev.filter((prevReview) => prevReview.id !== review?.id)
			);
			resetReview();
		} catch (error) {
			console.error(error);
		}
	}

	async function handleFeedbackChange(e) {
		setAdditionalFeedback(e.target.value);
	}

	const handleChipClick = (chip, event) => {
		setSelectedChips((prevSelected) => {
			const updatedChips = prevSelected.includes(chip)
				? prevSelected.filter((item) => item !== chip)
				: [...prevSelected, chip];
			const combinedString = [...updatedChips]
				.filter((item) => item !== "")
				.join(", ");
			updateReview(currVote, combinedString);
			return updatedChips;
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const combinedString = [...selectedChips, additionalFeedback]
			.filter(Boolean)
			.join(", ");
		updateReview(currVote, combinedString, true);
	};

	return (
		<div className={styles.container}>
			{!reviews?.length && (
				<Collapse in={!unRemarked}>
					<div className={styles.icon_container}>
						<ThumbUpAltIcon
							className="likebutton"
							sx={{
								fontSize: "19px",
								cursor: "pointer",
								[theme.breakpoints.up("sm")]: {
									"&:hover": {
										color: "blue",
										transform: "scale(1.1)",
									},
								},
							}}
							onClick={() => addVote(UPVOTE)}
						/>
						<Divider className="likebutton" orientation="vertical" flexItem />
						<Box className={styles.downVoteTop}>
							<ThumbDownAltIcon
								sx={{
									fontSize: "19px",
									cursor: "pointer",
									[theme.breakpoints.up("sm")]: {
										"&:hover": {
											color: "blue",
											transform: "scale(1.1)",
										},
									},
								}}
								onClick={() => addVote(DOWNVOTE)}
							/>
						</Box>
					</div>
				</Collapse>
			)}
			{reviewBox && (
				<Grow
					in={reviewBox}
					style={{ transformOrigin: "top right" }}
					{...(unRemarked ? { timeout: 500 } : {})}
				>
					<Box sx={{ p: 2, pt: 1, bgcolor: "white", borderRadius: 2 }}>
						<div
							style={{
								display: "flex",
								paddingBottom: "10px",
								justifyContent: "space-between",
							}}
						>
							<div style={{ display: "flex", gap: "2px" }}>
								<ThumbDownAltIcon fontSize="medium" />{" "}
								<p style={{ lineHeight: "120%" }}>Tell us more:</p>
							</div>
							<X
								onClick={() => setReviewBox(false)}
								style={{ cursor: "pointer" }}
							/>
						</div>
						<Box display="flex" gap={1} mb={1} flexWrap="wrap">
							{["Answer Incorrect", "Wrong link", "Wrong Button"].map(
								(label) => (
									<Chip
										key={label}
										tabIndex={-1}
										color={
											selectedChips.includes(label) ? "primary" : "default"
										}
										variant="outlined"
										onClick={(event) => handleChipClick(label, event)}
										label={label}
										sx={{ height: "30px" }}
									/>
								)
							)}
						</Box>
						<form onSubmit={handleSubmit}>
							<Box display="flex" gap={1} width="100%">
								<TextField
									label="Other"
									variant="outlined"
									size="small"
									value={additionalFeedback}
									onChange={handleFeedbackChange}
									sx={{
										width: "100%",
										py: 0,
										"& .MuiOutlinedInput-root": {
											padding: "0px 3px",
											fontSize: "0.875rem",
											minHeight: "30px",
										},
										"& .MuiInputLabel-root": {
											fontSize: "0.875rem",
											top: "0px",
										},
									}}
								/>
								<Button
									variant="contained"
									size="small"
									type="submit"
									disabled={loading}
									sx={{
										py: 0,
										px: 2,
										borderRadius: 2,
										minHeight: "30px",
										fontSize: "0.875rem",
									}}
								>
									<span
										style={{ display: "flex", gap: 2, alignItems: "center" }}
									>
										<Send size={15} />
										Submit
									</span>
								</Button>
							</Box>
						</form>
					</Box>
				</Grow>
			)}
		</div>
	);
};

export default withErrorBoundary(AddMessageReview, "AddMessageReview");
