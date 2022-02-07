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
type States = {
  initalConnection: boolean;
};

class Base extends Component<Props, States> {
  private connections: RTCPeerConnection[];
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      initalConnection: true,
    };

    this.connections = [];
  }

  handleSetup = async () => {
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });
    this.remoteStream = new MediaStream();

    (document.getElementById(
      "remoteAudioStream"
    ) as HTMLAudioElement).srcObject = this.remoteStream;
  };

  startListen = async () => {
    const connections = collection(firestore, "connections");

    onSnapshot(connections, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added" && !change.doc.data().answer) {
          this.handleJoin(change.doc.id);
        }
      });
    });
  };

  handleJoin = async (connId: string) => {
    this.connections.push(new RTCPeerConnection());
    let conn = this.connections[this.connections.length - 1];

    this.localStream?.getAudioTracks().forEach((track) => {
      if (this.localStream == null) return;

      conn.addTrack(track, this.localStream);
    });

    conn.addEventListener("track", async (e) => {
      e.streams[0].getAudioTracks().forEach((track) => {
        if (this.remoteStream == null) return;

        this.remoteStream.addTrack(track);
      });
    });

    const connDoc = doc(collection(firestore, "connections"), connId);
    const answerCandidates = collection(connDoc, "answerCandidates");
    const offerCandidates = collection(connDoc, "offerCandidates");

    conn.addEventListener(
      "icecandidate",
      (e) => e.candidate && addDoc(answerCandidates, e.candidate.toJSON())
    );

    const connData = (await getDoc(connDoc)).data();

    const offerDescription = connData?.offer;
    await conn.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await conn.createAnswer();
    await conn.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription?.type,
      sdp: answerDescription?.sdp,
    };

    await updateDoc(connDoc, { answer });

    onSnapshot(offerCandidates, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          let data = change.doc.data();
          conn.addIceCandidate(new RTCIceCandidate(data));
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
            <audio
              id="remoteAudioStream"
              title="OpenComm Base"
              autoPlay
              playsInline
            ></audio>

            <div className="justify-center pt-16 grid gap-4 grid-flow-col">
              <button
                onClick={() => {
                  this.handleSetup().then(this.startListen);
                }}
                className="bg-red-600 text-white w-32 h-32"
              >
                Setup
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
