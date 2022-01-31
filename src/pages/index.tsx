import Head from 'next/head';
import { Component } from 'react';

import { Navbar } from '@ui/Navbar';
import { Footer } from '@ui/Footer';

type Props = {};
type States = {};

export default class Home extends Component<Props, States> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <Head>
          <title>OpenComm</title>
          <meta name="description" content="Description" />
        </Head>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow"></main>
          <Footer />
        </div>
      </div>
    );
  }
}
