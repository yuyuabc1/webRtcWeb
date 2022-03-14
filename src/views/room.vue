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
          <video ref="userVideoRef" autoplay></video>
        </div>
        <div>
          <Chatting :list="chatRecord.list" :userName="userName" />
        </div>
      </el-aside>
    </el-container>
  </el-container>
  <Configure :visible="visible" :media="media" width="200px" height="200px" />
</template>
<script lang="ts">
import { getCurrentInstance, defineComponent, ref, reactive, onMounted,Ref } from "vue-demi";
import Configure from '../components/configure.vue';
import Chatting from '../components/chatting.vue';
import mediaControl from '../utils/media';
import { Msg, Record, Chat } from '../types';
import { useRoute } from 'vue-router'


export default defineComponent({
  setup() {
    const visible = ref(false);

    const userName = ref('');

    const chatRecord = reactive<Chat>({
      list: []
    });

    const route = useRoute();

    const userVideoRef = ref<Ref<HTMLMediaElement> | null>(null);

    const media = reactive(new mediaControl());

    const handleSetting = () => {
      visible.value = !visible.value;
    }

    const { appContext } = getCurrentInstance() as { appContext: any };
    const socket = appContext.config.globalProperties.$socket;

    onMounted(() => {
      media.getUserMedia(userVideoRef?.value, { audio: true, video: {
        width: 400,
        height: 400
        }
      });

      socket.on('action', (msg: Msg) => {
        // 修改名称
        if (msg.body && msg.body.subType === 1) {
          userName.value = msg.body.user as string;
        }
      });

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
      });

      socket.emit('joined', route.query.id);
    })


    return {
      visible,
      media,
      chatRecord,
      userName,
      handleSetting,
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
</style>