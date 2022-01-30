import Head from 'next/head';
import React from 'react';

interface Props {}

const PageNotFound: React.FC<Props> = () => {
  return (
    <div>
      <Head>
        <title>404 | {process.env.NEXT_PUBLIC_INFO_NAME}</title>
        <meta name="description" content="The requested page doesn't exist" />
      </Head>
      <div className="flex justify-center items-center min-h-screen">
        <div>
          <p className="text-primary-fg text-7xl font-sans lowercase text-center mb-3">
            404
          </p>
          <p className="text-white text-3xl font-sans text-center">
            Page Not Found
          </p>
          <div className="flex justify-center"></div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
