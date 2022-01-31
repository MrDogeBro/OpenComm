import '@styles/globals.scss';
import Head from 'next/head';
/* import Script from 'next/script'; */
import type { AppProps } from 'next/app';

function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>OpenComm</title>
        <meta name="description" content="Description" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Use favicon generator https://realfavicongenerator.net/ */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <link
          rel="mask-icon"
          href="/favicon/safari-pinned-tab.svg"
          color="#000000"
        />
        <meta
          name="apple-mobile-web-app-title"
          content="OpenComm"
        />
        <meta
          name="application-name"
          content="OpenComm"
        />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default App;
