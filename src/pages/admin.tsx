import Head from "next/head";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";

import { Slider } from "@ui/Slider";

type Props = {};
type States = {};

export default class Admin extends Component<Props, States> {
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
          <main className="flex-grow">
            <div className="flex justify-center mt-16 px-6">
              <Slider
                label="Number of Channels"
                minValue={1}
                maxValue={10}
                step={1}
                defaultValue={4}
              />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}
