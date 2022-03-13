<template>
  <div>
    <el-dialog v-model="visible" title="音视频设置">
      <el-form label-width="80px">
        <el-form-item v-for="(item, key) in device" :key="key" :label="item.label">
          <el-select v-model="device[key].choosed" :placeholder="`请选择您的${item.label}`">
            <el-option v-for="device in item.list" :label="device.label" :value="device.groupId" :key="device.label" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="visible = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';

const props = defineProps({
  visible: Boolean,
  media: Object
})

interface Device {
  list: MediaDeviceInfo[],
  label: string,
  choosed: null | MediaDeviceInfo
}

type DeviceMap = {
  [key: string]: Device
} 

const device: DeviceMap = reactive({
  audioinput: {
    list: [],
    label: '麦克风',
    choosed: null,
  },
  videoinput: {
    list: [],
    label: '摄像头',
    choosed: null
  },
  audiooutput: {
    list: [],
    label: '扬声器',
    choosed: null
  }
})

onMounted(async () => {
  const deviceList = await props?.media?.getDevice();
  // 麦克风列表
  device.audioinput.list = deviceList.filter((device: { kind: string; }) => device.kind == 'audioinput');
  // 摄像头列表
  device.videoinput.list = deviceList.filter((device: { kind: string; }) => device.kind == 'videoinput');
  // 扬声器列表
  device.audiooutput.list = deviceList.filter((device: { kind: string; }) => device.kind == 'audiooutput');
})
</script>

<style scoped>
</style>