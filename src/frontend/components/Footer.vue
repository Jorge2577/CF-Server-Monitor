<template>
  <footer class="footer status-bar">
    <span class="footer-stats">
      <span id="timeDate">{{ runningDaysText }}</span>
      <span class="footer-stats-sep" aria-hidden="true">|</span>
      <span class="footer-visits">总访问量 <span id="site_pv_counter">加载中...</span> 次</span>
      <span class="footer-stats-sep" aria-hidden="true">|</span>
      <span
        class="footer-version"
        :aria-label="updateTitle || undefined"
        :tabindex="hasWorkersUpdate ? 0 : undefined"
      >
        <span>@ws01 v3.0.0 2026</span>
        <span
          v-if="hasWorkersUpdate"
          class="version-update-dot"
          aria-hidden="true"
        ></span>
        <span
          v-if="hasWorkersUpdate"
          class="version-update-tooltip"
          role="tooltip"
        >{{ updateTitle }}</span>
      </span>
    </span>
    <span>by <a href="https://github.com/huilang-me/CF-Server-Monitor" target="_blank">CF-S-M</a></span>
  </footer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { LAST_WORKERS_VERSION, VERSION } from '../utils/api'
import { useTranslation } from '../utils/i18n'

// 网站启用时间（月/日/年 语义对应 2026-10-01），用于计算“稳定运行 N 天”。
const SITE_START_DATE = new Date('2026-10-01T00:00:00')
// 第三方访问量统计脚本，会填充 #site_pv_counter。
const SITE_PV_SCRIPT_URL = 'https://mjj.qzz.io/js'

const trans = useTranslation()
const currentVersion = computed(() => String(VERSION.value || '').trim())
const latestWorkersVersion = computed(() => String(LAST_WORKERS_VERSION.value || '').trim())
const hasWorkersUpdate = computed(() => latestWorkersVersion.value && currentVersion.value && latestWorkersVersion.value !== currentVersion.value)
const updateTitle = computed(() => {
  if (!hasWorkersUpdate.value) return ''
  return `${trans.value.workersUpdateAvailable || 'New version'} V${latestWorkersVersion.value}`
})

const runningDays = ref(null)
const runningDaysText = computed(() => (
  runningDays.value === null ? '载入天数...' : `稳定运行 ${runningDays.value} 天`
))

let runningDaysTimer = null

const updateRunningDays = () => {
  const elapsed = Date.now() - SITE_START_DATE.getTime()
  runningDays.value = Math.max(0, Math.floor(elapsed / 1000 / 60 / 60 / 24))
}

const loadSitePvCounter = () => {
  // 单页应用路由切换会重新挂载页脚，这里重新注入脚本，保证访问量每次都能刷新。
  const previous = document.querySelector('script[data-site-pv-counter]')
  if (previous) previous.remove()
  const script = document.createElement('script')
  script.defer = true
  script.src = SITE_PV_SCRIPT_URL
  script.setAttribute('data-site-pv-counter', '1')
  document.body.appendChild(script)
}

onMounted(() => {
  updateRunningDays()
  runningDaysTimer = setInterval(updateRunningDays, 1000)
  loadSitePvCounter()
})

onUnmounted(() => {
  if (runningDaysTimer) clearInterval(runningDaysTimer)
})
</script>
