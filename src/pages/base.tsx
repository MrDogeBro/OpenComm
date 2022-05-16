import Head from "next/head";
import { Component } from "react";

import { Navbar } from "@ui/Navbar";
import { Footer } from "@ui/Footer";
import { Button } from "@ui/Button";
import { Select, SelectItem } from "@ui/Select";
import { User as UserCard, UserType } from "@ui/User";

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
  inputMediaDevices: SelectItem[];
  currentMediaInputs: string[];
  connectedUsers: UserType[];
};

class Base extends Component<Props, States> {
  private connections: RTCPeerConnection[];
  private remoteStreams: MediaStream[];
  private localStream: MediaStream | null = null;
  private numStreams: number;

  constructor(props: Props) {
    super(props);

    this.connections = [];
    this.remoteStreams = new Array();
    this.numStreams = 4;

    this.state = {
      initalConnection: true,
      started: false,
      outputMediaDevices: new Array(this.numStreams),
      currentMediaOutputs: new Array(this.numStreams),
      inputMediaDevices: new Array(this.numStreams),
      currentMediaInputs: new Array(this.numStreams),
      connectedUsers: [],
    };
  }

  handleSetup = async () => {
    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Media device methods not supported.");
      return;
    }

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    let inputDevice = this.localStream
      .getAudioTracks()[0]
      .getSettings().deviceId;
    let currentInputs: string[] = new Array(
      this.state.currentMediaInputs.length
    );

    if (inputDevice) {
      currentInputs.fill(inputDevice);
      this.setState({ currentMediaInputs: currentInputs });
    }

    await this.getMediaDevices();

    for (let i = 0; i < this.numStreams - 1; i++)
      this.localStream?.addTrack(this.localStream.clone().getAudioTracks()[0]);

    this.setState({ started: true });

    for (let i = 0; i < this.numStreams; i++)
      this.remoteStreams.push(new MediaStream());

    for (let i = 0; i < this.numStreams; i++) {
      let audio = document.getElementById(
        `remoteAudioStream${i}`
      ) as HTMLAudioElement;
      audio.srcObject = this.remoteStreams[i];
      // @ts-ignore
      audio.setSinkId(this.state.currentMediaOutputs[i]);
    }
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

    const userInfo = connData?.userInfo;
    this.setState({ connectedUsers: [...this.state.connectedUsers, userInfo] });

    conn.addEventListener("iceconnectionstatechange", async () =>
      sleep(5000).then(() => {
        if (conn.iceConnectionState != "disconnected") return;

        console.log(this.connections);
        console.log(this.state.connectedUsers);
        this.connections = this.connections.filter((value) => {
          return value != conn;
        });
        this.setState({
          connectedUsers: this.state.connectedUsers.filter((value) => {
            return value != userInfo;
          }),
        });
        console.log(this.connections);
        console.log(this.state.connectedUsers);
        console.log("User disconnected");
      })
    );

    onSnapshot(offerCandidates, (snapshot: any) => {
      snapshot.docChanges().forEach((change: any) => {
        if (change.type === "added") {
          let data = change.doc.data();
          conn.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  getMediaDevices = async () => {
    let outputMediaDevices: SelectItem[] = [];
    let inputMediaDevices: SelectItem[] = [];
    let defaultOutputDevice: MediaDeviceInfo;
    let devicesList: MediaDeviceInfo[];

    let currentOutputs: string[] = new Array(
      this.state.currentMediaOutputs.length
    );

    if (typeof window === "undefined") return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error("enumerateDevices() not supported.");
      return;
    }

    await navigator.mediaDevices
      .enumerateDevices()
      .then((devices: MediaDeviceInfo[]) => {
        devicesList = devices;
        devices.forEach((device: MediaDeviceInfo) => {
          if (device.label.startsWith("Default - "))
            defaultOutputDevice = device;
          else if (device.kind == "audiooutput")
            outputMediaDevices.push({
              label: device.label,
              value: device.deviceId,
            });
          else if (device.kind == "audioinput")
            inputMediaDevices.push({
              label: device.label,
              value: device.deviceId,
            });
        });
      })
      .then(() => {
        let outputDevice = devicesList.find(
          (device) =>
            device.label ==
              defaultOutputDevice.label.replace("Default - ", "") &&
            device.groupId == defaultOutputDevice.groupId
        );

        currentOutputs.fill(outputDevice?.deviceId!);
        this.setState({
          outputMediaDevices: outputMediaDevices,
          inputMediaDevices: inputMediaDevices,
          currentMediaOutputs: currentOutputs,
        });
      });
  };

  updateStreamInput = () => {
    this.connections.forEach((conn) =>
      conn.getSenders().forEach((sender, idx) => {
        sender.replaceTrack(this.localStream?.getAudioTracks()[idx]!);
      })
    );
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
            {this.localStream?.getAudioTracks().map((_, index) => {
              return (
                <audio
                  id={`remoteAudioStream${index}`}
                  title={`OpenComm Base Channel ${index + 1}`}
                  autoPlay
                  playsInline
                  key={index + 1}
                ></audio>
              );
            })}

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
            {this.state.started
              ? this.localStream?.getAudioTracks().map((_, index) => {
                  return (
                    <div
                      className="grid gap-4 grid-flow-col justify-center pt-6"
                      key={index + 1}
                    >
                      <Select
                        className="w-80"
                        label={`Channel ${index + 1} Input`}
                        labelId={`channel-${index + 1}-input-label`}
                        value={
                          this.state.inputMediaDevices.find((obj) => {
                            if (obj == undefined) return false;
                            return (
                              obj.value == this.state.currentMediaInputs[index]
                            );
                          })?.value
                        }
                        items={this.state.inputMediaDevices}
                        onChange={async (event: SelectChangeEvent) => {
                          let newStream =
                            await navigator.mediaDevices.getUserMedia({
                              video: false,
                              audio: { deviceId: event.target.value },
                            });

                          let mediaStreamTracks: MediaStreamTrack[] = [];

                          for (
                            let i = index + 1;
                            i < this.localStream?.getAudioTracks().length!;
                            i++
                          ) {
                            mediaStreamTracks.push(
                              this.localStream?.getAudioTracks()[i]!
                            );
                            this.localStream?.removeTrack(
                              this.localStream.getAudioTracks()[i]
                            );
                            i--;
                          }

                          this.localStream?.removeTrack(
                            this.localStream.getAudioTracks()[index]
                          );
                          this.localStream?.addTrack(
                            newStream.getAudioTracks()[0]
                          );

                          for (let i = 0; i < mediaStreamTracks.length; i++)
                            this.localStream?.addTrack(mediaStreamTracks[i]);

                          let inputs = this.state.currentMediaInputs;
                          inputs[index] = event.target.value;

                          this.setState({ currentMediaInputs: inputs });
                          this.updateStreamInput();
                        }}
                      />
                      <Select
                        className="w-80"
                        label={`Channel ${index + 1} Output`}
                        labelId={`channel-${index + 1}-output-label`}
                        value={
                          this.state.outputMediaDevices.find((obj) => {
                            if (obj == undefined) return false;
                            return (
                              obj.value == this.state.currentMediaOutputs[index]
                            );
                          })?.value
                        }
                        items={this.state.outputMediaDevices}
                        onChange={(event: SelectChangeEvent) => {
                          let audio = document.getElementById(
                            `remoteAudioStream${index}`
                          ) as HTMLAudioElement;
                          // @ts-ignore
                          audio.setSinkId(event.target.value).then(() => {
                            let outputs = this.state.currentMediaOutputs;
                            outputs[index] = event.target.value;

                            this.setState({ currentMediaOutputs: outputs });
                          });
                        }}
                      />
                    </div>
                  );
                })
              : null}
            <div
              className={`text-white pt-16 mx-auto w-2/4 ${
                this.state.connectedUsers.length == 0 ? "hidden" : null
              }`}
            >
              <h1 className="text-center mb-4 text-xl">Connected Users</h1>
              {this.state.connectedUsers.map((user: UserType) => {
                return <UserCard name={user.name} className="mb-4" />;
              })}
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default Base;
