/** @type {import('next').NextConfig} */
const nextConfig = {
    headers: async () => {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  