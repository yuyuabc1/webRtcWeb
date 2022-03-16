import { Stream } from "stream";

const DEFAULTCONSTRANINTS = { audio: true, video: true };

class MediaControl {
  constructor(constraints: MediaStreamConstraints = DEFAULTCONSTRANINTS) {
    const supported = this.mediaSupport();
    if (!supported) return;
  }

  deviceList: MediaDeviceInfo[] = [];

  private mediaSupport = (): Boolean => {
    if(!navigator.mediaDevices
    ) {
        console.log('mediaDevices is not supported!');
        return false;
      }
    if (!navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia is not supported!');
      return false;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices is not supported!");
      return false;
    }
    return true;
  }

  public getDevice = async () => {
    let deviceList: MediaDeviceInfo[] = [];
    deviceList = await navigator.mediaDevices.enumerateDevices();
    this.deviceList = deviceList;
    return deviceList;
  }

  public getUserMedia = async (target: HTMLMediaElement | null, constraints: MediaStreamConstraints = DEFAULTCONSTRANINTS): Promise<MediaStream | null>=> {

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (target) target.srcObject = stream;

      return stream;
      // .then((stream) => {
      //   if (target) target.srcObject = stream;
      //   /* 使用这个stream stream */
      //   console.log('!!!!', stream)
      //   localStream = stream; 
      //   return stream;
      // })
      // .catch(function(err) {
      //   /* 处理error */
      //   console.log('getUserMedia: error:', err);
      // });
      /* use the stream */
    } catch(err) {
      /* handle the error */
      console.log('getUserMedia: error:', err);
    }

    return null;
  }

  public closeLocalMedia = (stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }
}

export default MediaControl;