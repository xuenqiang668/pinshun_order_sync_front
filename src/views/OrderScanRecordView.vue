<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getOrderScanRecordPageApi, type TemuOrderScanRecordResult } from '@/api/orderScanRecord'

const loading = ref(false)
const pageData = ref<TemuOrderScanRecordResult[]>([])
const total = ref(0)

const queryForm = reactive({
  timeRange: [] as string[],
  current: 1,
  size: 10,
})

const formatTimeParams = () => {
  const [startTime, endTime] = queryForm.timeRange || []
  return { startTime, endTime }
}

const fetchPage = async () => {
  loading.value = true
  try {
    const { startTime, endTime } = formatTimeParams()
    const res = await getOrderScanRecordPageApi({
      startTime,
      endTime,
      current: queryForm.current,
      size: queryForm.size,
    })
    pageData.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取订单扫码记录失败')
  } finally {
    loading.value = false
  }
}

const onSearch = () => {
  queryForm.current = 1
  fetchPage()
}

const onReset = () => {
  queryForm.timeRange = []
  queryForm.current = 1
  fetchPage()
}

const onPageChange = (page: number) => {
  queryForm.current = page
  fetchPage()
}

const formatCreateTime = (createTime?: string) => {
  if (!createTime) return '-'
  const date = dayjs(createTime)
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : createTime
}

onMounted(() => {
  fetchPage()
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
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            class="!w-[440px]"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table v-loading="loading" :data="pageData" border stripe class="result-table">
      <el-table-column prop="orderNo" label="订单号" min-width="220" />
      <el-table-column prop="createUserName" label="创建用户" min-width="180" />
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
