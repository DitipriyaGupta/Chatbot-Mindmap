import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import PhotoSizeSelectActualIcon from "@mui/icons-material/PhotoSizeSelectActual";
import { AddBox, DeleteForeverOutlined } from "@mui/icons-material";
import styles from "./IconBox.module.css";
import { IconButton } from "@mui/material";

const thumbsContainer = {
	display: "flex",
	flexDirection: "row",
	flexWrap: "wrap",
	marginTop: 16,
	width: "100%",
	height: "200px",
	justifyContent: "center",
	alignItems: "center",
	position: "relative",
};

const thumb = {
	display: "inline-flex",
};

const thumbInner = {
	display: "flex",
	border: "1px solid #eaeaea",
	marginBottom: 8,
	marginRight: 8,
	width: "80px",
	height: "80px",
	padding: 12,
	boxSizing: "border-box",
	overflow: "hidden",
	borderRadius: "50%",
	overflow: "hidden",
};

const img = {
	display: "block",
	width: "100%",
	height: "100%",
};

const IconBox = ({ icon, setIcon }) => {
	// const [icon, setIcon] = React.useState([]);
	const onDrop = useCallback((acceptedFiles) => {
		setIcon(
			acceptedFiles.map((file) => {
				let res = Object.assign(file, {
					preview: URL.createObjectURL(file),
				});
				// let file = acceptedFiles[0]
				var reader = new FileReader();
				reader.onload = function () {
					res["data"] = reader.result;
				};
				reader.readAsDataURL(file);
				return res;
			})
		);
	}, []);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			"image/*": [".png", ".gif", ".jpg", ".jpeg"],
		},
		onDrop: onDrop,
	});

	const thumbs = icon.map((file) => (
		<div style={thumb} key={file.name}>
			<div style={thumbInner}>
				<img
					src={file.preview}
					style={img}
					// Revoke data uri after image is loaded
					onLoad={() => {
						URL.revokeObjectURL(file.preview);
					}}
				/>
			</div>

			<IconButton
				classes={{
					root: styles.deleteIconBox,
				}}
				onClick={() => setIcon([])}
				size="large"
			>
				<DeleteForeverOutlined
					classes={{
						root: styles.deleteIcon,
					}}
				/>
			</IconButton>
		</div>
	));

	return (
		<div className={[styles.IconBox, "configItem"].join(" ")}>
			<div {...getRootProps()}>
				<input {...getInputProps()} />
				{
					<div className={styles.uploadBox}>
						{isDragActive ? (
							<div className={styles.uploadBoxActive}>
								<AddBox color="primary" fontSize="large" />
							</div>
						) : (
							<>
								<PhotoSizeSelectActualIcon
									classes={{
										root: styles.uploadIcon,
									}}
								/>
								<p>Drag 'n' drop, or click to select image</p>
							</>
						)}
					</div>
				}
			</div>
			<aside style={thumbsContainer}>{thumbs}</aside>
		</div>
	);
};

export default withErrorBoundary(IconBox, "IconBox");
