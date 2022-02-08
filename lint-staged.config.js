const lintStagedConfig = {
	// Type check TypeScript files
	'**/*.(ts|tsx)': () => 'yarn tsc --noEmit',

	// Lint then format TypeScript and JavaScript files
	'**/*.(ts|tsx|js)': (filenames) => `yarn lint --fix ${filenames.join(' ')}`,

	// Format MarkDown and JSON
	'**/*.(md|json)': (filenames) =>
		`yarn prettier --write ${filenames.join(' ')}`,
};

module.exports = lintStagedConfig;
