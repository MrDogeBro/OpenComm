export class Mic {
  static mute = (track: MediaStreamTrack) => {
    track.enabled = false;
  };

  static unmute = (track: MediaStreamTrack) => {
    track.enabled = true;
  };

  static isMuted = (track: MediaStreamTrack) => {
    return !track.enabled;
  };

  static muteStream = (stream: MediaStream) => {
    stream.getAudioTracks().forEach((track) => (track.enabled = false));
  };

  static unmuteStream = (stream: MediaStream) => {
    stream.getAudioTracks().forEach((track) => (track.enabled = true));
  };

  static isMutedStream = (stream: MediaStream) => {
    let muted = false;
    stream
      .getAudioTracks()
      .forEach((track) => (!track.enabled ? (muted = true) : null));
    return muted;
  };
}
