import React from 'react';
import {useField} from 'formik';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import GetApp from '@mui/icons-material/GetApp';

interface FileUploadFieldProps {
	name: string;
	disabled: boolean;
}

/**
 * Field to upload a file.
 */
const FileUploadField: React.FC<FileUploadFieldProps> = ({name, disabled}) => {
	const [field, meta, helpers] = useField<File>(name);

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		// @ts-expect-error Lazyness
		if (event.target.files.length > 0) {
			// @ts-expect-error Lazyness
			helpers.setValue(event.target.files[0]);
		}
	};

	return (
		<div>
			<Button
				fullWidth
				color="primary"
				variant="outlined"
				startIcon={<GetApp />}
				component="label"
				style={{textTransform: field.value ? 'initial' : 'uppercase'}}
				disabled={disabled}
			>
				<input
					id="file"
					type="file"
					style={{display: 'none'}}
					onChange={handleChange}
				/>
				{field.value
					? `${field.value.name} (${(field.value.size / 1_000_000).toFixed(
							0,
					  )} MB)`
					: 'Upload your results (Max 5 GB)'}
			</Button>

			{meta.error && (
				<Typography color="error" variant="caption">
					{meta.error}
				</Typography>
			)}
		</div>
	);
};

export default FileUploadField;
