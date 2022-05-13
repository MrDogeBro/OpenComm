import Head from "next/head";
import { NextPageContext } from "next";
import { withRouter, NextRouter } from "next/dist/client/router";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";
import { Button } from "@ui/Button";
import { User as UserCard, UserType } from "@ui/User";

import { Mic } from "@utils/mic";

import firestore from "@firestore";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

type Props = { query: QueryProps; router: NextRouter };
type QueryProps = { userName: string; userId: string };

type States = {
  muted: boolean[];
  listening: boolean[];
  started: boolean;
  remoteStreamUpdate: boolean;
  user: UserType;
};

class User extends Component<Props, States> {
  private conn: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private numStreams: number;

  private users = [
    { name: "Testing User", id: "2340df" },
    { name: "test2 user test", id: "234dfkdfg" },
  ];

  constructor(props: Props) {
    super(props);

    this.numStreams = 4;

    this.state = {
      muted: [],
      listening: [],
      started: false,
      remoteStreamUpdate: true,
      user: { name: "", id: "" },
    };

    if (typeof window !== "undefined") {
      this.conn = new RTCPeerConnection();
    }
  }

  static getInitialProps({ query }: NextPageContext) {
    return { query };
  }

  componentDidMount = () => {
    let query = this.props.query;

    if (query.userId || query.userName) {
      this.users.forEach((user) => {
        if (user.id.toLowerCase() == query.userId.toLowerCase())
          this.setState({ user: user });
        else if (user.name.toLowerCase() == query.userName.toLowerCase())
          this.setState({ user: user });
      });
      this.handleSetup().then(this.handleStart);
    }
  };

  handleSetup = async () => {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    for (let i = 0; i < this.numStreams - 1; i++) {
      this.localStream?.addTrack(this.localStream.clone().getAudioTracks()[0]);
      this.setState({ muted: [...this.state.muted, true] });
      this.setState({ listening: [...this.state.listening, true] });
    }

    this.setState({ muted: [...this.state.muted, true] });
    this.setState({ listening: [...this.state.listening, true] });

    this.setState({ started: true });
    Mic.muteStream(this.localStream);

    this.remoteStream = new MediaStream();

    this.localStream.getAudioTracks().forEach((track) => {
      if (this.localStream == null) return;

      this.conn?.addTrack(track, this.localStream);
    });

    this.conn?.addEventListener("track", async (e) => {
      e.streams[0].getAudioTracks().forEach((track) => {
        if (this.remoteStream == null) return;

        this.remoteStream.addTrack(track);
        this.setState({ remoteStreamUpdate: !this.state.remoteStreamUpdate });
      });
    });

    (
      document.getElementById("remoteAudioStream") as HTMLAudioElement
    ).srcObject = this.remoteStream;
  };

  handleStart = async () => {
    const connDoc = doc(collection(firestore, "connections"));
    const offerCandidates = collection(connDoc, "offerCandidates");
    const answerCandidates = collection(connDoc, "answerCandidates");

    this.conn?.addEventListener(
      "icecandidate",
      (e) => e.candidate && addDoc(offerCandidates, e.candidate.toJSON())
    );

    const offerDescription = await this.conn?.createOffer();
    this.conn?.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription?.sdp,
      type: offerDescription?.type,
    };

    const userInfo = {
      userName: this.state.user.name,
      userId: this.state.user.id,
    };

    await setDoc(connDoc, { offer, userInfo });

    onSnapshot(connDoc, (snapshot: any) => {
      const data = snapshot.data();

      if (!this.conn?.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        this.conn?.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          this.conn?.addIceCandidate(candidate);
        }
      });
    });
  };

  render() {
    return (
      <div>
        <Head>
          <title>User | OpenComm</title>
          <meta name="description" content="Description" />
        </Head>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <audio
              id="remoteAudioStream"
              title="OpenComm User"
              autoPlay
              playsInline
            ></audio>

            <div
              className={`pt-16 mx-auto w-2/4 ${
                this.state.user.id.length > 0 ? "hidden" : null
              }`}
            >
              {this.users.map((user) => {
                return (
                  <UserCard
                    name={user.name}
                    className="mb-4"
                    onClick={() => {
                      this.setState({ user: user });
                      this.props.router.push(
                        `user?userName=${user.name.replace(
                          " ",
                          "%20"
                        )}&userId=${user.id.replace(" ", "%20")}`
                      );
                      this.handleSetup().then(this.handleStart);
                    }}
                    key={user.id}
                  />
                );
              })}
            </div>

            <div className="flex justify-center">
              <span className="text-white text-center text-xl mt-16">
                {this.state.user.name}
              </span>
            </div>

            <div className="grid gap-4 grid-flow-col justify-center pt-6">
              {this.localStream?.getAudioTracks().map((track, index) => {
                return (
                  <div key={index + 1}>
                    <h1 className="text-white p-3 text-center">
                      Channel {index + 1}
                    </h1>
                    <Button
                      onClick={() => {
                        if (track == null) return;

                        if (Mic.isMuted(track)) Mic.unmute(track);
                        else Mic.mute(track);

                        let mutedStateTemp = this.state.muted;
                        mutedStateTemp[index] = Mic.isMuted(track);

                        this.setState({
                          muted: mutedStateTemp,
                        });
                      }}
                      disabled={!this.state.started}
                      color="primary"
                      className="w-full"
                    >
                      {this.state.muted[index] ? "Unmute" : "Mute"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 grid-flow-col justify-center pt-6">
              {this.remoteStream?.getAudioTracks().map((track, index) => {
                return (
                  <div key={index + 1}>
                    <h1 className="text-white p-3 text-center">
                      Channel {index + 1}
                    </h1>
                    <Button
                      onClick={() => {
                        if (track == null) return;

                        if (Mic.isMuted(track)) Mic.unmute(track);
                        else Mic.mute(track);

                        let listeningStateTemp = this.state.listening;
                        listeningStateTemp[index] = !Mic.isMuted(track);

                        this.setState({
                          listening: listeningStateTemp,
                        });
                      }}
                      disabled={!this.state.started}
                      color="secondary"
                      className="w-full"
                    >
                      {this.state.listening[index]
                        ? "Stop Listening"
                        : "Listen"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default withRouter(User);
