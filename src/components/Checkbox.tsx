import React from 'react';
import {useField} from 'formik';
import {Checkbox, CheckboxProps, FormControlLabel} from '@mui/material';

interface CheckboxFieldProps extends CheckboxProps {
	/**
	 * Name of the field.
	 */
	name: string;
	/**
	 * Label of the field.
	 * Default: ''.
	 */
	label: string | JSX.Element;
}

/**
 * A checkbox with a label (integrated with Formik).
 */
const CheckboxField = ({name, label = '', ...props}: CheckboxFieldProps) => {
	const [field] = useField<boolean>(name);

	return (
		<FormControlLabel
			control={<Checkbox checked={field.value} {...field} {...props} />}
			label={label}
		/>
	);
};

export default CheckboxField;
