import React from 'react';
import {useField} from 'formik';
import {
	Checkbox,
	CheckboxProps,
	FormControlLabel,
	Typography,
} from '@mui/material';

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
	const [field, meta] = useField<boolean>(name);

	return (
		<>
			<FormControlLabel
				control={<Checkbox checked={field.value} {...field} {...props} />}
				label={label}
			/>
			{meta.touched && Boolean(meta.error) && (
				<Typography
					color="error"
					variant="caption"
					sx={{display: 'block', marginLeft: 4}}
				>
					{meta.error}
				</Typography>
			)}
		</>
	);
};

export default CheckboxField;
