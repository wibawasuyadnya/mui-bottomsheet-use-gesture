import React from "react";
import PropTypes from "prop-types";
import { styled, Box, Stack, ToggleButton, IconButton } from "@mui/material";
import {
	ExpandLess as ExpandIcon,
	Close as CloseIcon,
	SwipeVertical as DragIcon,
} from "@mui/icons-material";
import { TOGGLE, DRAGGABLE, CLOSE } from "../actions";

const contains = (...args) => Array.prototype.includes.call(...args);

const ExpandToggle = styled((props) => {
	const { expand, ...rest } = props;
	return <IconButton {...rest} />;
})(({ theme, expand }) => ({
	transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
	transition: theme.transitions.create("transform", {
		duration: theme.transitions.duration.shortest,
	}),
}));

const Drag = styled((props) => {
	const { ...rest } = props;
	return <ToggleButton {...rest} />;
})({
	borderRadius: 99,
});

const Close = styled((props) => {
	const { ...rest } = props;
	return <IconButton {...rest} />;
})({
	marginLeft: "8px",
});

const Left = styled(Box)({
	flex: 1,
});

const Right = styled(Box)({
	display: "flex",
	flex: 1,
	justifyContent: "flex-end",
});

const BottomSheetHeader = (props) => {
	const { isDraggable = false, actions, expand } = props;
	const { onToggleClick, onDragToggle, onCloseClick } = props;

	return (
		<Stack
			sx={{
				margin: 1,
			}}
			direction="row"
			justifyContent="flex-start"
			alignItems="flex-start"
			spacing={1}
		>
			<Left>
				{contains(actions, TOGGLE) ? (
					<ExpandToggle
						expand={expand}
						onClick={onToggleClick}
						disabled={isDraggable}
					>
						<ExpandIcon />
					</ExpandToggle>
				) : null}
			</Left>
			<Right>
				{contains(actions, DRAGGABLE) ? (
					<Drag value="draggable" selected={isDraggable} onClick={onDragToggle}>
						<DragIcon />
					</Drag>
				) : null}
				{contains(actions, CLOSE) ? (
					<Close onClick={onCloseClick}>
						<CloseIcon
							sx={{
								width: "2rem",
							}}
						/>
					</Close>
				) : null}
			</Right>
		</Stack>
	);
};

BottomSheetHeader.propTypes = {
	/**
	 *  Boolean state for toggle Drag Button
	 *  @default false
	 */
	isDraggable: PropTypes.bool,
	/**
	 * The actions that wanted to show
	 */
	actions: PropTypes.array,
	/**
	 * Boolean state for toggle expand
	 * @default false
	 */
	expand: PropTypes.bool,
	/**
	 * Callback for handle on toggle click
	 */
	onToggleClick: PropTypes.func,
	/**
	 * Callback for handle on drag toggle
	 */
	onDragToggle: PropTypes.func,
	/**
	 * Callback for handle on close click
	 */
	onCloseClick: PropTypes.func,
};

export { BottomSheetHeader };
