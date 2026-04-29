<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
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

onMounted(() => {
  fetchPage()
})
</script>

<template>
  <el-card>
    <template #header>
      <div class="font-semibold">订单扫码记录</div>
    </template>

    <el-form inline class="mb-4">
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="queryForm.timeRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          class="!w-[420px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="pageData" border stripe>
      <el-table-column prop="orderNo" label="订单号" min-width="220" />
      <el-table-column prop="createUserName" label="创建用户" min-width="180" />
      <el-table-column prop="createTime" label="创建时间" min-width="200" />
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
