import { useState, useCallback } from "react";
import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";

const getDimensionObject = (node) => {
	const rect = node.getBoundingClientRect();

	return {
		width: rect.width,
		height: rect.height,
		top: "x" in rect ? rect.x : rect.top,
		left: "y" in rect ? rect.y : rect.left,
		x: "x" in rect ? rect.x : rect.left,
		y: "y" in rect ? rect.y : rect.top,
		right: rect.right,
		bottom: rect.bottom,
	};
};

const useDimension = ({ liveMeasure = true } = {}) => {
	const [dimension, setDimension] = useState({});
	const [node, setNode] = useState(null);

	const ref = useCallback((node) => {
		setNode(node);
	}, []);

	useIsomorphicLayoutEffect(() => {
		if (node) {
			const measure = () => {
				window.requestAnimationFrame(() =>
					setDimension(getDimensionObject(node))
				);
			};
			measure();

			if (liveMeasure) {
				window.addEventListener("resize", measure);
				window.addEventListener("scroll", measure);

				return () => {
					window.removeEventListener("resize", measure);
					window.removeEventListener("scroll", measure);
				};
			}
		}
	}, [node]);

	return [
		ref,
		{
			dimension,
			node,
		},
	];
};

export { useDimension };
