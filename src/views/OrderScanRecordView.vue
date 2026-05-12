<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { DATETIME_FORMAT } from '@/config/datetime'
import {
  getOrderScanRecordPageApi,
  getOrderScanRecordStatApi,
  type ScanRecordStatResult,
  type TemuOrderScanRecordResult,
} from '@/api/orderScanRecord'

const loading = ref(false)
const pageData = ref<TemuOrderScanRecordResult[]>([])
const total = ref(0)
const statData = ref<ScanRecordStatResult>({})

const getCurrentMonthTimeRange = () => [
  dayjs().startOf('month').format(DATETIME_FORMAT),
  dayjs().endOf('month').format(DATETIME_FORMAT),
]

const queryForm = reactive({
  timeRange: getCurrentMonthTimeRange(),
  /** 扫描单价类型：1 扫描，2 入库；不选则不限 */
  priceType: undefined as number | undefined | null,
  current: 1,
  size: 10,
})

const formatTimeParams = () => {
  const [startTime, endTime] = queryForm.timeRange || []
  return { startTime, endTime }
}

const buildListParams = () => {
  const { startTime, endTime } = formatTimeParams()
  const priceType = queryForm.priceType != null ? queryForm.priceType : undefined
  return { startTime, endTime, priceType }
}

const loadPage = async () => {
  const { startTime, endTime, priceType } = buildListParams()
  const res = await getOrderScanRecordPageApi({
    startTime,
    endTime,
    priceType,
    current: queryForm.current,
    size: queryForm.size,
  })
  pageData.value = res.records
  total.value = res.total
}

const loadStat = async () => {
  const { startTime, endTime, priceType } = buildListParams()
  statData.value = await getOrderScanRecordStatApi({ startTime, endTime, priceType })
}

const fetchPage = async (withStat: boolean) => {
  loading.value = true
  try {
    if (withStat) {
      await Promise.all([loadPage(), loadStat()])
    } else {
      await loadPage()
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取订单扫码记录失败')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  queryForm.current = 1
  void fetchPage(true)
}

const onReset = () => {
  queryForm.timeRange = getCurrentMonthTimeRange()
  queryForm.priceType = undefined
  queryForm.current = 1
  void fetchPage(true)
}

const onPageChange = (page: number) => {
  queryForm.current = page
  void fetchPage(false)
}

const formatStatPrice = (p?: number) => {
  if (p === undefined || p === null || Number.isNaN(Number(p))) return '-'
  return `￥ ${Number(p).toFixed(2)}`
}

const formatCreateTime = (createTime?: string) => {
  if (!createTime) return '-'
  const date = dayjs(createTime)
  return date.isValid() ? date.format(DATETIME_FORMAT) : createTime
}

onMounted(() => {
  void fetchPage(true)
})
</script>

<template>
  <el-card class="record-page-card !rounded-xl !border-0">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-base font-semibold text-slate-800">订单扫码记录</div>
        <el-tag type="info" effect="plain">共 {{ total }} 条</el-tag>
      </div>
    </template>

    <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <el-form inline class="query-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.timeRange"
            type="datetimerange"
            :value-format="DATETIME_FORMAT"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            class="!w-[440px]"
          />
        </el-form-item>
        <el-form-item label="扫描单价类型">
          <el-select v-model="queryForm.priceType" clearable placeholder="全部" class="!w-40">
            <el-option label="扫描" :value="1" />
            <el-option label="入库" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div
      class="mb-4 flex flex-wrap items-center gap-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
    >
      <span class="font-medium text-slate-800">当前条件统计</span>
      <span>
        总数量：
        <strong class="text-slate-900">{{ statData.totalNum ?? '-' }}</strong>
      </span>
      <span>
        总金额：
        <strong class="text-emerald-700">{{ formatStatPrice(statData.totalPrice) }}</strong>
      </span>
    </div>

    <el-table v-loading="loading" :data="pageData" border stripe class="result-table">
      <el-table-column prop="orderNo" label="订单号" min-width="220" />
      <el-table-column prop="createUserName" label="创建用户" min-width="180" />
      <el-table-column prop="priceType" label="扫描单价类型" min-width="180">
        <template #default="{ row }">
          <span v-if="row.priceType">
            <el-tag v-if="row.priceType === 1" type="info" effect="plain">扫描</el-tag>
            <el-tag v-else type="success" effect="plain">入库</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价" min-width="180">
        <template #default="{ row }">
          <span v-if="row.price">￥ {{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="200">
        <template #default="{ row }">
          {{ formatCreateTime(row.createTime) }}
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="queryForm.size"
        :current-page="queryForm.current"
        @current-change="onPageChange"
      />
    </div>
  </el-card>
</template>

<style scoped>
.record-page-card {
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}

.query-form :deep(.el-form-item) {
  margin-bottom: 8px;
}

.result-table :deep(.el-table__header th) {
  background-color: #f8fafc;
  color: #334155;
  font-weight: 600;
}
</style>
