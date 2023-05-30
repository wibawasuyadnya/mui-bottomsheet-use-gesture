import React from "react";
import PropTypes from "prop-types";
import { colors, styled, Box } from "@mui/material";

const { grey } = colors;

const Notch = styled(Box)({
	position: "absolute",
	borderTopLeftRadius: "16px",
	borderTopRightRadius: "16px",
	visibility: "visible",
	top: 0,
	right: 0,
	left: 0,
});

const Pull = styled(Box)(({ notchWidth, theme }) => ({
	width: `var(--notch-width, ${notchWidth}vw)`,
	height: 6,
	backgroundColor: theme.palette.mode === "light" ? grey[300] : grey[900],
	borderRadius: 3,
	position: "absolute",
	top: "calc(12px + var(--bottomsheet-offset-top))",
	left: "50%",
	transform: "translateX(-50%)",
}));

const BottomSheetDefaultHeader = (props) => {
	const { notchWidth } = props;
	return (
		<Notch>
			<Pull notchWidth={notchWidth} />
		</Notch>
	);
};

BottomSheetDefaultHeader.propTypes = {
	/**
	 * Custom notch width of the custom bottom sheet header
	 */
	notchWidth: PropTypes.number,
};

export { BottomSheetDefaultHeader };
