import React from 'react';

import TextField from 'components/TextField';

interface WorkerFormProps {
	prefix: string;
}

const WorkerForm = ({prefix}: WorkerFormProps) => {
	return (
		<>
			<TextField
				fullWidth
				name={prefix + 'companyName'}
				label="Company name"
				variant="standard"
			/>
			<TextField
				fullWidth
				name={prefix + 'companyRole'}
				label="Your role inside the company"
				variant="standard"
			/>
		</>
	);
};

export default WorkerForm;
