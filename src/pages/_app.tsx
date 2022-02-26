import React from 'react';
import Head from 'next/head';
import {AppProps} from 'next/app';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {CacheProvider, EmotionCache} from '@emotion/react';
import theme from 'theme';
import createEmotionCache from 'createEmotionCache';
import Copyright from 'components/Copyright';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
	emotionCache?: EmotionCache;
}

const MyApp = ({
	Component,
	emotionCache = clientSideEmotionCache,
	pageProps,
}: MyAppProps) => {
	return (
		<CacheProvider value={emotionCache}>
			<Head>
				<meta name="viewport" content="initial-scale=1, width=device-width" />
			</Head>
			<ThemeProvider theme={theme}>
				<div
					style={{minHeight: '100vh', position: 'relative', paddingBottom: 55}}
				>
					{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
					<CssBaseline />
					<Component {...pageProps} />
					<Copyright />
				</div>
			</ThemeProvider>
		</CacheProvider>
	);
};

export default MyApp;
