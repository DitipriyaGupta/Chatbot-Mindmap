import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { SketchPicker } from "react-color";
import { TextField, Popover } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";

const useStyles = makeStyles((theme) =>
	createStyles({
		colorPreview: {
			width: "36px",
			height: "16px",
			borderRadius: "2px",
			backgroundColor: ({ color }) => color,
			boxShadow: "0px 0px 0px 1px gray",
		},
		popover: {
			zIndex: theme.zIndex.modal + 1,
		},
		input: {
			width: "100%",
		},
	})
);

const UniversalColorPicker = ({
	value,
	onChange,
	colorNames,
	TextFieldProps,
}) => {
	const [anchorEl, setAnchorEl] = useState(null);
	const classes = useStyles({ color: value });

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleColorChange = (color) => {
		onChange(color.hex);
	};

	const handleInputChange = (event) => {
		onChange(event.target.value);
	};

	// const handleTextFieldClick = () => {
	//   setAnchorEl(anchorEl ? null : document.body);
	// };

	return (
		<>
			<div
				className={classes.colorPreview}
				onClick={handleClick}
				role="button"
				aria-controls="color-picker-popover"
				aria-haspopup="true"
				tabIndex={0}
			/>
			<TextField
				{...TextFieldProps}
				value={value}
				onChange={handleInputChange}
				className={classes.input}
			/>
			<Popover
				id="color-picker-popover"
				open={Boolean(anchorEl)}
				anchorEl={anchorEl}
				onClose={handleClose}
				classes={{
					paper: classes.popover,
				}}
			>
				<SketchPicker
					color={value}
					onChange={handleColorChange}
					presetColors={colorNames}
				/>
			</Popover>
		</>
	);
};

UniversalColorPicker.propTypes = {
	value: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	colorNames: PropTypes.arrayOf(PropTypes.string),
	TextFieldProps: PropTypes.object,
};

UniversalColorPicker.defaultProps = {
	colorNames: [],
	TextFieldProps: {},
};

export default withErrorBoundary(UniversalColorPicker, "UniversalColorPicker");
