<template>
  <router-link :to="to" class="server-card" :data-region="regionCode">
    <div class="server-card-header">
      <div class="server-identity">
        <span v-if="regionCode && regionCode !== 'xx'" class="country-os-icons">
          <img class="flag-img" :src="getPublicAssetUrl('flags/' + regionCode + '.svg')" :alt="regionCode">
          <OsIcon :os="server.os" />
        </span>
        <span v-else class="country-os-icons">
          <span class="flag-fallback">🏳️</span>
          <OsIcon :os="server.os" />
        </span>
        <span class="server-name">{{ server.name }}</span>
      </div>
      <span class="status-label" :style="{ color: statusColor, borderColor: statusColor }">{{ statusText }}</span>
    </div>
    <div class="server-meta">
      <div class="card-meta">
        <div v-if="sysConfig.show_price && priceText" class="card-meta-item">💰 {{ priceText }}</div>
        <div v-if="sysConfig.show_expire && server.expire_date" class="card-meta-item card-meta-expire">
          📅 <span :class="{ 'expired': isExpired }">{{ expireText }}</span>
          <span v-if="expireDateTitle" class="card-meta-tooltip">{{ expireDateTitle }}</span>
        </div>
      </div>
      <div class="card-badges">
        <span v-for="(tag, index) in tagList" :key="tag" :class="['badge', 'badge-tag', tagColorClass(index)]">{{ tag }}</span>
        <span v-if="hasPublicIPv4 && hasPublicIPv6" class="badge badge-v4-v6">IPv4/6</span>
        <template v-else>
          <span v-if="hasPublicIPv4" class="badge badge-v4">IPv4</span>
          <span v-if="hasPublicIPv6" class="badge badge-v6">IPv6</span>
        </template>
      </div>
    </div>
    <div class="card-spec-row">
      <span class="spec-item spec-cpu">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2"></rect><path d="M4 9h3M4 15h3M17 9h3M17 15h3M9 4v3M15 4v3M9 17v3M15 17v3"></path></svg>
        {{ cpuCoresText }} Cores
      </span>
      <span class="spec-item spec-ram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="8" rx="1.5"></rect><path d="M7 8V5M12 8V5M17 8V5M7 16v3M12 16v3M17 16v3"></path></svg>
        {{ ramTotalText }} 
      </span>
      <span class="spec-item spec-disk">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l2 10H3L5 7z"></path><path d="M8 17v2h8v-2M9 11h6"></path></svg>
        {{ diskTotalText }} 
      </span>
    </div>
    <div class="server-stats">
      <div class="stat-row">
        <span class="stat-key">CPU</span>
        <div class="stat-content stat-content-meter">
          <div class="stat-bar-container">
            <div class="stat-bar-fill" :style="{ width: cpuPercent + '%', background: getBarUsageColor(cpuPercent) }"></div>
          </div>
          <span class="stat-value">{{ cpuPercent.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">内存</span>
        <div class="stat-content stat-content-meter">
          <div class="stat-bar-container">
            <div class="stat-bar-fill" :style="{ width: ramPercent + '%', background: getBarUsageColor(ramPercent) }"></div>
          </div>
          <span class="stat-value">{{ ramPercent.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">SWAP</span>
        <div class="stat-content stat-content-meter">
          <div class="stat-bar-container">
            <div class="stat-bar-fill" :style="{ width: swapPercent + '%', background: getBarUsageColor(swapPercent) }"></div>
          </div>
          <span class="stat-value">{{ swapPercent.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">硬盘</span>
        <div class="stat-content stat-content-meter">
          <div class="stat-bar-container">
            <div class="stat-bar-fill" :style="{ width: diskPercent + '%', background: getBarUsageColor(diskPercent) }"></div>
          </div>
          <span class="stat-value">{{ diskPercent.toFixed(2) }}%</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">网速</span>
        <div class="stat-content">
          <span class="net-down">↓{{ netInSpeed }}/s</span>
          <span class="net-up">↑{{ netOutSpeed }}/s</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">流量</span>
        <div class="stat-content">
          <span class="net-down">↡{{ totalRxMonthly }}</span>
          <span class="net-up">↟{{ totalTxMonthly }}</span>
          <span v-if="sysConfig.show_tf && server.traffic_limit" class="stat-limit">/📦{{ formatBytes(server.traffic_limit * 1024 * 1024 * 1024) }}</span>
        </div>
      </div>
      <div class="stat-row">
        <span class="stat-key">负载</span>
        <div class="stat-content">
          <span class="net-down">{{ loadAvg[0].toFixed(2) }}</span>|
          <span>{{ loadAvg[1].toFixed(2) }}</span>|
          <span class="net-up">{{ loadAvg[2].toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <div class="server-space"></div>
    <ServerLatencyPanel
      :show-three-net-details="sysConfig.show_three_net_details"
      :has-three-net-details="hasThreeNetDetails"
      :three-net-details="threeNetDetails"
      :has-ping-data="hasPingData"
      :ping-list="pingList"
      :timeout-text="trans.timeout"
      :get-ping-color="getPingColor"
      :get-loss-color="getLossColor"
      :format-ping-value="formatPingValue"
      :format-loss-value="formatLossValue"
      :is-ping-valid="isPingValid"
    />
    <div class="card-time-row">
      <span>到期：{{ cardExpireDateText }}</span>
      <span>在线：{{ cardUptimeText }}</span>
    </div>
  </router-link>
</template>

<script setup>
import OsIcon from './OsIcon.vue'
import ServerLatencyPanel from './ServerLatencyPanel.vue'
import { DEFAULT_SERVER_CARD_CONFIG, useServerCardData } from '../composables/useServerCardData'

const props = defineProps({
  server: {
    type: Object,
    required: true
  },
  sysConfig: {
    type: Object,
    default: () => ({ ...DEFAULT_SERVER_CARD_CONFIG })
  },
  to: {
    type: String,
    default: ''
  }
})

const {
  trans,
  regionCode,
  statusColor,
  statusText,
  cpuPercent,
  cpuCoresText,
  ramTotalText,
  diskTotalText,
  ramPercent,
  swapPercent,
  diskPercent,
  tagList,
  tagColorClass,
  hasPublicIPv4,
  hasPublicIPv6,
  netInSpeed,
  netOutSpeed,
  totalRxMonthly,
  totalTxMonthly,
  priceText,
  expireDateTitle,
  loadAvg,
  isExpired,
  expireText,
  cardExpireDateText,
  cardUptimeText,
  isPingValid,
  getPingColor,
  getLossColor,
  formatPingValue,
  formatLossValue,
  pingList,
  hasPingData,
  threeNetDetails,
  hasThreeNetDetails,
  getPublicAssetUrl,
  formatBytes
} = useServerCardData(props)

const getBarUsageColor = (percent) => {
  const value = Number(percent)
  if (!Number.isFinite(value) || value < 50) return '#008B45'
  if (value < 80) return '#FF8247'
  return '#FF0000'
}
</script>
