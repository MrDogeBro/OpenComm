import Head from "next/head";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";

import firestore from "@firestore";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";

type Props = {};
type States = {};

class Base extends Component<Props, States> {
  private conn: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {};

    if (typeof window !== "undefined") {
      this.conn = new RTCPeerConnection();
    }
  }

  handleSetup = async () => {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    this.remoteStream = new MediaStream();

    this.localStream.getAudioTracks().forEach((track) => {
      if (this.localStream == null) return;

      this.conn?.addTrack(track, this.localStream);
    });

    this.conn?.addEventListener("track", async (e) => {
      e.streams[0].getAudioTracks().forEach((track) => {
        if (this.remoteStream == null) return;

        this.remoteStream.addTrack(track);
      });
    });

    (
      document.getElementById("remoteAudioStream") as HTMLAudioElement
    ).srcObject = this.remoteStream;
  };

  handleStart = async () => {
    console.log("hey");
    const callDoc = doc(collection(firestore, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");

    console.log(callDoc.id);

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

    await setDoc(callDoc, { offer });

    onSnapshot(callDoc, (snapshot: any) => {
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
          <title>Base | OpenComm</title>
          <meta name="description" content="Description" />
        </Head>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <audio id="remoteAudioStream" autoPlay playsInline></audio>

            <div className="justify-center pt-16 grid gap-4 grid-flow-col">
              <button
                onClick={this.handleSetup}
                className="bg-red-600 text-white w-32 h-32"
              >
                Setup
              </button>
              <button
                onClick={this.handleStart}
                className="bg-red-600 text-white w-32 h-32"
              >
                Start
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Base;
