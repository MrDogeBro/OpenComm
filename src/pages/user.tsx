import Head from "next/head";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";

import firestore from "@firestore";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

type Props = {};
type States = {};

class User extends Component<Props, States> {
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

    (document.getElementById(
      "remoteAudioStream"
    ) as HTMLAudioElement).srcObject = this.remoteStream;
  };

  handleJoin = async () => {
    console.log("hello");
    const callId = (document.getElementById("callId") as HTMLInputElement)
      .value;
    const callDoc = doc(collection(firestore, "calls"), callId);
    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    this.conn?.addEventListener(
      "icecandidate",
      (e) => e.candidate && addDoc(answerCandidates, e.candidate.toJSON())
    );

    console.log(callDoc.id);
    const callData = (await getDoc(callDoc)).data();

    const offerDescription = callData?.offer;
    await this.conn?.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await this.conn?.createAnswer();
    await this.conn?.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription?.type,
      sdp: answerDescription?.sdp,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        console.log(change);

        if (change.type === "added") {
          let data = change.doc.data();
          this.conn?.addIceCandidate(new RTCIceCandidate(data));
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
            <audio id="remoteAudioStream" autoPlay playsInline></audio>

            <div className="justify-center pt-16 grid gap-4 grid-flow-col">
              <button
                onClick={this.handleSetup}
                className="bg-red-600 text-white w-32 h-32"
              >
                Setup
              </button>
              <button
                onClick={this.handleJoin}
                className="bg-red-600 text-white w-32 h-32"
              >
                Join
              </button>
            </div>

            <div className="pt-5 flex justify-center">
              <input
                id="callId"
                className="bg-gray-800 text-white py-1 px-4"
                placeholder="Call ID"
              />
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default User;
