import Head from 'next/head';
import { App } from '../src/index.js';

export default function Home() {
  return (
    <>
      <Head>
        <title>swipeable-drawer</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <App />
    </>
  );
}
