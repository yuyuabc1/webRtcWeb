<template>
  <div class="body">
    <div class="title">
      视频聊天室
    </div>
    <div class="subtitle">
      请输入您想进入的聊天室号码
    </div>
    <div class="input-box">
      <el-input class="input-wrapper" v-model="input" />
    </div>
    <div class="btn-box">
      <el-button type="primary" class="btn" @click="handleJoin">输入</el-button>
      <el-button type="primary" class="btn" @click="handleGenerate">随机生成</el-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue' 
import { ElMessage } from 'element-plus';
import { getCurrentInstance } from 'vue-demi';
import { useRouter } from 'vue-router'

const input = ref('');

const router = useRouter()

const { appContext } = getCurrentInstance() as { appContext: any };
const socket = appContext.config.globalProperties.$socket;

const handleJoin = () => {
  if (!input.value) {
    ElMessage('请输入聊天室号码')
  }

  sessionStorage.setItem('room_id', input.value);  

  router.push({
    path: '/room',
    query: {
      id: input.value
    }
  })
}

const handleGenerate = () => {
  const value = String(Math.floor(Math.random() * 1000 + 1));
  input.value = value;
}
</script>

<style>
.body {
  height: 100%;
  color: #fff;
  padding: 0 200px;
}

.title {
  padding-top: 200px;
  font-size: 80px;
}

.subtitle {
  font-size: 40px;
  padding-top: 20px;
}

.btn-box {
  padding-left: 30px;
}

.btn-box .btn {
  width: 200px;
  height: 60px;
  font-size: 26px;
  margin-right: 30px;
}

.input-box{
  padding: 40px 0 40px 30px;
  width: 750px;
}

.input-wrapper .el-input__inner {
  background-color: transparent;
  height: 60px;
  color: #fff;
  font-size: 30px;
  box-shadow: none;
  border-radius: 0px;
  border-bottom: 4px solid #fff;
}

.input-wrapper .el-input__inner:focus { outline: none; box-shadow: none; } 

.el-input__inner:hover {
  box-shadow: none;
}
</style>