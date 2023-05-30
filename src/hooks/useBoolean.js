import { useState } from "react";

const useBoolean = (defaultValue) => {
	const [value, setValue] = useState(defaultValue || false);

	const setTrue = () => setValue(true);
	const setFalse = () => setValue(false);
	const toggle = () => setValue((x) => !x);

	return { value, setValue, setTrue, setFalse, toggle };
};

export { useBoolean };
