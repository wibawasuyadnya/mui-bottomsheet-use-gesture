import { useState, useRef } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import { useEventListener } from "./useEventListener";

const useWindowSize = () => {
	const [isReady, setIsReady] = useState(false);
	const history = useRef(null);
	const [states, setStates] = useState({
		previous: null,
		current: {
			width: 0,
			height: 0,
		},
	});
	const handleSize = () => {
		const updateWindowSize = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		if (!history.current) {
			history.current = [null, updateWindowSize];
		} else {
			history.current = [history.current[1], updateWindowSize];
		}
		setStates({
			previous: history.current[0],
			current: history.current[1],
		});
		setIsReady(true);
	};
	useEventListener("resize", handleSize);
	// Set size at the first client-side load
	useIsomorphicLayoutEffect(() => {
		handleSize();
		return () => {
			setIsReady(false);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return {
		...states,
		isReady,
	};
};

export { useWindowSize };
