/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
	reactStrictMode: true,
  experimental: {
    outputStandalone: true,
  },
  redirects: [
    {
      source: '/',
      destination: '/register',
      permanent: false
    }
  ]
};

module.exports = nextConfig;
