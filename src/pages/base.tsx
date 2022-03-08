import Head from "next/head";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";
import { Button } from "@ui/Button";
import { Select, SelectItem } from "@ui/Select";

import { sleep } from "@utils/time";

import firestore from "@firestore";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { SelectChangeEvent } from "@mui/material";

type Props = {};
type States = {
  initalConnection: boolean;
  started: boolean;
  outputMediaDevices: SelectItem[];
  currentMediaOutputs: string[];
};

class Base extends Component<Props, States> {
  private connections: RTCPeerConnection[];
  private remoteStreams: MediaStream[];
  private localStream: MediaStream | null = null;

  constructor(props: Props) {
    super(props);

    this.state = {
      initalConnection: true,
      started: false,
      outputMediaDevices: new Array(4),
      currentMediaOutputs: new Array(4),
    };

    this.connections = [];
    this.remoteStreams = [];
  }

  handleSetup = async () => {
    if (typeof window === "undefined") return;

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      // @ts-ignore
      !navigator.mediaDevices.selectAudioOutput
    ) {
      console.error("Media device methods not supported.");
      return;
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    // @ts-ignore
    let device = await navigator.mediaDevices.selectAudioOutput();
    let currentOutputs: string[] = new Array(
      this.state.currentMediaOutputs.length
    );

    currentOutputs.fill(device.deviceId);
    this.setState({ currentMediaOutputs: currentOutputs });

    this.getMediaDevices();

    for (let i = 0; i < 3; i++)
      this.localStream?.addTrack(this.localStream.clone().getAudioTracks()[0]);

    this.setState({ started: true });
    // for (let i = 0; i < 4; i++) this.remoteStreams.push(new MediaStream());
    this.remoteStreams.fill(new MediaStream());

    (
      document.getElementById("remoteAudioStream") as HTMLAudioElement
    ).srcObject = this.remoteStreams[0];
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
      e.streams[0].getAudioTracks().forEach((track, index) => {
        if (this.remoteStreams.length == 0) return;

        this.remoteStreams[index].addTrack(track);
      });
    });

    const connDoc = doc(collection(firestore, "connections"), connId);
    const answerCandidates = collection(connDoc, "answerCandidates");
    const offerCandidates = collection(connDoc, "offerCandidates");

    conn.addEventListener(
      "icecandidate",
      (e) => e.candidate && addDoc(answerCandidates, e.candidate.toJSON())
    );

    conn.addEventListener("iceconnectionstatechange", async () =>
      sleep(5000).then(() => {
        if (conn.iceConnectionState != "disconnected") return;

        console.log("User disconnected");
      })
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

  getMediaDevices = () => {
    let outputMediaDevices: SelectItem[] = [];

    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error("enumerateDevices() not supported.");
      return;
    }

    navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        devices.forEach((device: MediaDeviceInfo) => {
          if (device.kind == "audiooutput")
            outputMediaDevices.push({
              label: device.label,
              value: device.deviceId,
            });
        });
      })
      .then(() => this.setState({ outputMediaDevices: outputMediaDevices }));
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
              <Button
                onClick={() => {
                  this.handleSetup().then(this.startListen);
                }}
                color="primary"
              >
                Setup
              </Button>
            </div>
            {this.state.started ? (
              <div className="grid gap-4 grid-flow-col justify-center pt-6">
                <Select
                  className="w-64"
                  label="Channel 1 Output"
                  labelId="channel-1-output-label"
                  value={
                    this.state.outputMediaDevices.find((obj) => {
                      if (obj == undefined) return false;
                      return obj.value == this.state.currentMediaOutputs[0];
                    })?.value
                  }
                  items={this.state.outputMediaDevices}
                  onChange={(event: SelectChangeEvent) => {
                    let audio = document.getElementById(
                      "remoteAudioStream"
                    ) as HTMLAudioElement;
                    // @ts-ignore
                    audio.setSinkId(event.target.value).then(() => {
                      let outputs = this.state.currentMediaOutputs;
                      outputs[0] = event.target.value;

                      this.setState({ currentMediaOutputs: outputs });
                      console.log(audio);
                    });
                  }}
                />
              </div>
            ) : null}
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Base;
