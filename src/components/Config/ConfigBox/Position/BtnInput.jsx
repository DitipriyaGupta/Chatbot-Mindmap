import { withErrorBoundary } from "components/ErrorBoundary/ErrorBoundary.jsx";
import React from "react";
import { TextField, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

const BtnInput = ({ value, setValue }) => {
	// const [value, setValue] = useState(value);

	const handleIncrement = () => {
		setValue(value + 1);
	};

	const handleDecrement = () => {
		setValue(value - 1);
	};

	const handleInputChange = (event) => {
		const inputValue = event.target.value;
		setValue(Number(inputValue));
	};

	return (
		<div>
			<IconButton onClick={handleIncrement} size="large">
				<Add />
			</IconButton>
			<TextField
				label="Value"
				type="number"
				value={value}
				onChange={handleInputChange}
				InputProps={{
					inputProps: { min: 0 },
					endAdornment: (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}
						>
							<span style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)" }}>
								px
							</span>
						</div>
					),
				}}
			/>
			<IconButton onClick={handleDecrement} size="large">
				<Remove />
			</IconButton>
		</div>
	);
};

export default withErrorBoundary(BtnInput, "BtnInput");
