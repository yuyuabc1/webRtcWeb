<template>
  <el-container>
    <el-container>
      <el-container>
        <el-header>
          <div class="setting">
            <el-icon :size="30" @click="handleSetting" class="sett-ion">
              <setting />
            </el-icon>
          </div>
        </el-header>
        <el-main>Main</el-main>
      </el-container>
      <el-aside class="aside-box">
        <div>
          <video ref="remoteUserVideoRef" autoplay class="remote-video"></video>
          <video ref="userVideoRef" autoplay class="current-video"></video>
        </div>
        <div>
          <Chatting :list="chatRecord.list" :userName="userName" :roomId="roomId" />
        </div>
      </el-aside>
    </el-container>
  </el-container>
  <Configure :visible="visible" :media="media" width="200px" height="200px" />
</template>
<script lang="ts">
import { getCurrentInstance, defineComponent, ref, reactive, onMounted, onUnmounted, Ref } from "vue-demi";
import Configure from '../components/configure.vue';
import Chatting from '../components/chatting.vue';
import mediaControl from '../utils/media';
import { Msg, Record, Chat } from '../types';
import { useRoute } from 'vue-router'


interface SOURCE {
  pc: RTCPeerConnection | null,
  stream: MediaStream | null
}

export default defineComponent({
  setup() {
    const visible = ref(false);

    const route = useRoute();

    const roomId = ref('');

    roomId.value = (route.query.id || sessionStorage.getItem('room_id') || '') as string;

    const userName = ref('');

    // 状态
    const state = ref('unjoined');

    const source = reactive<SOURCE>({
      pc: null,
      stream: null
    });

    const chatRecord = reactive<Chat>({
      list: []
    });

    const userVideoRef = ref<Ref<HTMLMediaElement> | null>(null);

    const remoteUserVideoRef = ref<Ref<HTMLMediaElement> | null>(null);

    const media = reactive(new mediaControl());

    const { appContext } = getCurrentInstance() as { appContext: any };
    const socket = appContext.config.globalProperties.$socket;

    const handleSetting = () => {
      visible.value = !visible.value;
    }

    const getPeerConnection = (localStream: MediaStream | null, mine: Boolean = false): void => {

        // stun 服务，如果要做到 NAT 穿透，还需要 turn 服务	
        const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]}

        let PeerConnection = window.RTCPeerConnection;

        // 创建 peer 实例	
        source.pc = new PeerConnection(configuration);

        if (source.pc) {
          console.log('localStream', localStream);
          if (localStream) {
            localStream.getTracks().forEach((track) => {
              if (source.pc) {
                console.log('向PeerConnection中加入需要发送的流', track);
                source.pc.addTrack(track);
              }
            });
          }

        if (mine) {
          const RTCOfferOptions = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          }
          source.pc.createOffer(RTCOfferOptions)
            .then((desc) => { 
              console.log('createOffer', desc); 
              if (source.pc) {
                // 从信令服务器 接收 SDP
                source.pc.setLocalDescription(desc)
                if (socket) {
                  // 发送 SDP 信息给信令服务器
                  socket.emit('peerconnection', roomId.value, desc)
                }
              };
            })
            .catch(err => {
              console.log('create offer fail:', err);
            });
        }


          // 当pc接收到RTCPeerConnection上的track 获取到对方的remote stream
          source.pc.ontrack = function(event) {
            console.warn('ontrack', event);
            if (remoteUserVideoRef.value) {
              if (event.streams && event.streams[0]) {
                remoteUserVideoRef.value.srcObject = event.streams[0];
              } else {
                let inboundStream = new MediaStream();
                remoteUserVideoRef.value.srcObject = inboundStream;
                inboundStream.addTrack(event.track);
              }
            }
          }

          // 发送ICE候选到其他客户端	 
          source.pc.onicecandidate = (event) => {	
            if (event.candidate) {
              console.log('find a new candidate', event.candidate);
              socket.emit('peerconnection', roomId.value, {
                candidate: event.candidate,
                type: 'candidate'
              });
            } else {
              // 不发送
            }
          };
        }
    }

    const close = () => {
      if (socket) {
        socket.emit('leave', roomId.value, );
        socket.disconnect();
      }

      if (media && source.stream) {
        media.closeLocalMedia(source.stream);
        source.stream = null;
      }

      if (source.pc) {
        source.pc!.close();
        source.pc = null;
      }

      state.value = 'leaved';
    }

    const initSocket = () => {
      // 用户操作行为
      socket.on('action', (msg: Msg) => {
        // 修改名称
        if (msg.body && msg.body.subType === 1) {
          userName.value = msg.body.user as string;
        }
      });

      // 用户消息行为
      socket.on('message', (msg: Msg) => {
        if (msg.body && msg.type === 'JOIN') {
          chatRecord.list.push({
            type: 0,
            user: msg.body.user!
          })
        }

        if (msg.body && msg.type === 'TALK') {
          chatRecord.list.push(msg.body);
        }

        if (msg.body && msg.type === 'LEAVE') {
           //
        }
      });

      interface RTCIceCandidate {
        candidate: string,
        sdpMid: string,
        sdpMLineIndex: number | null | undefined
        type: string
      }

      socket.on('peerconnection', (
        roomId: string,
        data: RTCSessionDescriptionInit | { type: string, candidate: RTCIceCandidate }
      ) => {
        console.log('receive client message:', roomId, data);
        if (data && source.pc) {
          switch(data.type) {
            case 'offer':
              // 接收发起端SDP
              console.log('offer:');
              source.pc.setRemoteDescription(
                new RTCSessionDescription(data as RTCSessionDescriptionInit)
              )
              source.pc.createAnswer()
                .then((desc) => {
                  // 储存SDP到本地
                  source.pc!.setLocalDescription(desc);
                  // 发送answer请求
                  socket.emit('peerconnection', roomId, desc);
                })
                .catch((err) => {
                  // 创建应答失败
                  console.log(err);
                })
              break;
            case 'answer':
              // 接收 应答端的SDP
              console.log('answer:');
              source.pc.setRemoteDescription(
                new RTCSessionDescription(data as RTCSessionDescriptionInit)
              )
              break;
            case 'candidate':
              console.log('candidate:', data);
              const { candidate } = data;
              source.pc.addIceCandidate(new RTCIceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                sdpMid: candidate.sdpMid,
                candidate: candidate.candidate
              }));
              break;
            default:
              console.error('the p2p message is error', data);
          }
        }
      })
    }

    onMounted(async () => {

      // 初始化本地socket环境
      initSocket();

      // 连接进入信令服务器
      if (state.value === 'unjoined') {
        socket.emit('joined', roomId.value);
      }

      // 获取本地音频视频
      source.stream = await media.getUserMedia(userVideoRef?.value, { audio: true, video: {
        width: 400,
        height: 400
        }
      });
      // 搭建WebRTC连接
      getPeerConnection(source.stream, true);
    })

    window.onunload = function (e) {
      close();
    }

    return {
      roomId,
      visible,
      media,
      chatRecord,
      userName,
      handleSetting,
      remoteUserVideoRef,
      userVideoRef
    }
  },
  components: {
    Configure,
    Chatting
  }
})
</script>
<style>
  .el-container {
    height: 100%;
  }
  .el-header, .el-footer {
    /* background-color: #B3C0D1; */
    color: #333;
    text-align: center;
    position: relative;
  }
  
  .el-aside {
    background-color: rgb(27, 28, 31);
    color: #333;
    text-align: center;
    width: 400px;
  }
  
  .el-main {
    background-color: #1d1e22;
    color: #333;
    text-align: center;
  }
  
  body > .el-container {
    margin-bottom: 40px;
  }

  .setting {
    cursor: pointer;
    color: #fff;
    display: inline-block;
    position: absolute;
    bottom: 20%;
    right: 20px;
  }
  
  .icon-setting {
    height: 50px;
    width: 50px;
  }

  .aside-box {
    width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .remote-video{
    position: absolute;
    top: 0;
    right: 0;
    width: 400px;
    height: 400px;
  }

  .current-video{
    position: absolute;
    top: 250px;
    right: 0;
    width: 150px;
    height: 150px;
  }
</style>