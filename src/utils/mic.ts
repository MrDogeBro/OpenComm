export class Mic {
  static mute = (stream: MediaStream) => {
    stream.getAudioTracks().forEach((track) => (track.enabled = false));
  };

  static unmute = (stream: MediaStream) => {
    stream.getAudioTracks().forEach((track) => (track.enabled = true));
  };

  static isMuted = (stream: MediaStream) => {
    let muted = false;
    stream
      .getAudioTracks()
      .forEach((track) => (!track.enabled ? (muted = true) : null));
    return muted;
  };
}
