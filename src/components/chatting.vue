<template>
  <div>
    <div class="room"  ref="recordRef">
      <div v-for="record in list">
        <div
          v-if="record.type === 0"
        >
         ——{{ record.user }}加入房间——
        </div>
        <div class="user-message" v-if="record.type === 1">
          {{ record.user }}: {{ record.content }}
        </div>
        <el-divider></el-divider>
      </div>
    </div>
    <div>
        <el-input
          v-model="textarea"
          maxlength="50"
          placeholder="请输入聊天内容，按Enter发送"
          rows="4"
          type="textarea"
          @keyup.enter="handleSubmit"
        />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onRenderTriggered, nextTick, watch } from 'vue-demi';
import { Record } from '../types';
import { useRoute } from 'vue-router';

const textarea = ref('');

const recordRef = ref({
  scrollHeight: 0,
  scrollTop: 0
});

const route = useRoute();

const { appContext } = getCurrentInstance() as { appContext: any };
const socket = appContext.config.globalProperties.$socket;

const props = defineProps({
  list: {
    type: Array as () => Record[],
    default: [],
  },
  userName: String,
  roomId: {
    type: String,
    default: ''
  }
})

watch(
  () => props.list,
  () => {
    nextTick(() => {
      const srcollHeight = recordRef.value.scrollHeight;
      recordRef.value.scrollTop = srcollHeight;
    })
  },
  { deep: true }
)



const handleSubmit = () => {
  socket.emit('message', {
    type: 1,
    user: props.userName,
    room_id: props.roomId,
    time: new Date().getTime(),
    content: textarea.value
  })
  textarea.value = '';
};
</script>

<style scoped>
.room {
  background: white;
  height: 240px;
  padding-top:24px;
  overflow: auto;
}

.room::-webkit-scrollbar {
  display: none
}

.user-message {
  text-align: left;
  padding-left: 10px;
}
</style>
