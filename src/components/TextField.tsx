import React from 'react';
import {
	TextField as MUITextField,
	TextFieldProps as MUITextFieldProps,
} from '@mui/material';
import {useField} from 'formik';

type TextFieldProps = MUITextFieldProps & {
	name: string;
};

const TextField = ({name, ...props}: TextFieldProps) => {
	const [field, meta] = useField(name);

	return (
		<MUITextField
			{...field}
			{...props}
			name={name}
			error={meta.touched && Boolean(meta.error)}
			helperText={meta.touched && meta.error}
			sx={{minHeight: 72}}
		/>
	);
};

export default TextField;
