import React from "react";
import { Box, Stack, Button, colors } from "@mui/material";
import { useBoolean } from "./hooks/useBoolean";
import { BottomSheet } from "./BottomSheet";
import { TOGGLE, DRAGGABLE, CLOSE } from "./BottomSheet/actions";

const App = () => {
	const {
		value: isOpen,
		setTrue: showDrawer,
		setFalse: hideDrawer,
	} = useBoolean(false);

	const handleClick = () => {
		showDrawer();
	};

	return (
		<>
			<Box
				sx={{
					backgroundColor: colors.grey[200],
					width: "100%",
					height: "100vh",
				}}
			>
				<Stack
					direction="row"
					justifyContent="center"
					alignItems="center"
					sx={{
						height: "100%",
					}}
				>
					<Button
						variant="outlined"
						sx={{
							textTransform: "uppercase",
							backgroundColor: "#fff",
						}}
						onClick={handleClick}
					>
						Show BottomSheet Drawer
					</Button>
				</Stack>
			</Box>
			<BottomSheet
				threshold={[0, "auto", 1]}
				elevation={0}
				header={{
					type: "actions",
					actions: [TOGGLE, DRAGGABLE, CLOSE],
				}}
				open={isOpen}
				onOpen={showDrawer}
				onClose={hideDrawer}
			>
				<Box
					sx={{
						width: "100%",
						height: "30vh",
					}}
				/>
			</BottomSheet>
		</>
	);
};

export { App };
