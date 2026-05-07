<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { TableInstance } from 'element-plus'
import dayjs from 'dayjs'
import {
  addTailWaybillApi,
  getPrintConfigListApi,
  getTailWaybillPageApi,
  getTailWaybillPrintDetailPageApi,
  getTailWaybillPrintListApi,
  type FactoryPrintConfigResult,
  type TemuTailWaybillPrintDetailResult,
  type TemuTailWaybillPrintPageResult,
  type WaybillPrintFileResult,
} from '@/api/tailWaybill'
import { copyToClipboard } from '@/utils/copyToClipboard'
import { printDocument } from '@/utils/print'
import { withTimeout } from '@/utils/withTimeout'

const loading = ref(false)
const pageData = ref<TemuTailWaybillPrintPageResult[]>([])
const total = ref(0)

const getTodayTimeRange = () => [
  dayjs().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
]

const queryForm = reactive({
  orderNo: '',
  timeRange: getTodayTimeRange(),
  current: 1,
  size: 10,
})

const tailWaybillSearch = ref('')

const printDialogVisible = ref(false)
const printListLoading = ref(false)
const printList = ref<WaybillPrintFileResult[]>([])
const selectedPrintRows = ref<WaybillPrintFileResult[]>([])
const addLoading = ref(false)
const printConfigList = ref<FactoryPrintConfigResult[]>([])
const printTableRef = ref<TableInstance>()

const printConfigNameMap = computed(() => {
  const map = new Map<string, string>()
  printConfigList.value.forEach(platform => {
    platform.configItemList?.forEach(item => {
      map.set(item.printConfigUniCode, `${platform.platformName} / ${item.configItemName}`)
    })
  })
  return map
})

const formatTimeParams = () => {
  const [startTime, endTime] = queryForm.timeRange || []
  return { startTime, endTime }
}

const fetchPage = async () => {
  loading.value = true
  try {
    const { startTime, endTime } = formatTimeParams()
    const res = await getTailWaybillPageApi({
      orderNo: queryForm.orderNo || undefined,
      startTime,
      endTime,
      current: queryForm.current,
      size: queryForm.size,
    })
    pageData.value = res.records
    total.value = res.total
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取分页数据失败')
  } finally {
    loading.value = false
  }
}

const fetchPrintConfig = async () => {
  try {
    printConfigList.value = await getPrintConfigListApi()
  } catch {
    printConfigList.value = []
  }
}

const onSearch = () => {
  queryForm.current = 1
  fetchPage()
}

const onReset = () => {
  queryForm.orderNo = ''
  queryForm.timeRange = getTodayTimeRange()
  queryForm.current = 1
  fetchPage()
}

const onPageChange = (page: number) => {
  queryForm.current = page
  fetchPage()
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = dayjs(value)
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : value
}

const copyOrderText = async (raw?: string) => {
  const text = raw?.trim()
  if (!text) {
    ElMessage.warning('无可复制内容')
    return
  }
  try {
    await copyToClipboard(text)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

const tailWaybillPrintListLoading = ref(false)
const getTailWaybillPrintList = async () => {
  if (!tailWaybillSearch.value) {
    ElMessage.warning('请先输入第三方单号')
    return
  }
  try {
    tailWaybillPrintListLoading.value = true
    printList.value = await getTailWaybillPrintListApi(tailWaybillSearch.value)

    if (printList.value.length === 0) {
      ElMessage.warning('未获取到可打印面单')
      return
    }

    await Promise.all(
      printList.value.map(item =>
        withTimeout(
          printDocument(item.url, item.fileType, item.printConfigUniCode),
          15000,
          '打印超时，请检查打印服务是否已启动',
        ),
      ),
    )

    ElMessage.success(`打印任务已发送，共 ${printList.value.length} 条`)
    await fetchPage()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取面单失败')
    printList.value = []
  } finally {
    tailWaybillSearch.value = ''
    tailWaybillPrintListLoading.value = false
  }
}

const onPrintSelectionChange = (rows: WaybillPrintFileResult[]) => {
  selectedPrintRows.value = rows
}

const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const detailRecords = ref<TemuTailWaybillPrintDetailResult[]>([])
const detailTotal = ref(0)
const detailQuery = reactive({
  parentId: '',
  current: 1,
  size: 10,
})

const openPrintDetail = (row: TemuTailWaybillPrintPageResult) => {
  detailQuery.parentId = row.id
  detailQuery.current = 1
  detailDialogVisible.value = true
  void fetchDetailPage()
}

const fetchDetailPage = async () => {
  if (!detailQuery.parentId) return
  detailLoading.value = true
  try {
    const res = await getTailWaybillPrintDetailPageApi({
      id: detailQuery.parentId,
      current: detailQuery.current,
      size: detailQuery.size,
    })
    detailRecords.value = res.records
    detailTotal.value = res.total
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取详情失败')
    detailRecords.value = []
    detailTotal.value = 0
  } finally {
    detailLoading.value = false
  }
}

const onDetailPageChange = (page: number) => {
  detailQuery.current = page
  void fetchDetailPage()
}

const onDetailSizeChange = (size: number) => {
  detailQuery.size = size
  detailQuery.current = 1
  void fetchDetailPage()
}

const submitAddTailWaybill = async () => {
  if (selectedPrintRows.value.length === 0) {
    ElMessage.warning('请至少选择一条面单')
    return
  }
  addLoading.value = true
  try {
    await addTailWaybillApi(selectedPrintRows.value.map(item => item.waybillId))
    ElMessage.success('添加成功')
    printDialogVisible.value = false
    printTableRef.value?.clearSelection()
    await fetchPage()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '添加失败')
  } finally {
    addLoading.value = false
  }
}

onMounted(() => {
  fetchPage()
  fetchPrintConfig()
})
</script>

<template>
  <el-card class="page-card !rounded-xl !border-0">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-base font-semibold text-slate-800">揽收/尾程打印明细</div>
        <el-tag type="info" effect="plain">共 {{ total }} 条</el-tag>
      </div>
    </template>

    <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <el-form inline class="query-form">
        <el-form-item label="第三方单号">
          <el-input v-model.trim="queryForm.orderNo" placeholder="请输入第三方单号" clearable class="!w-72" />
        </el-form-item>
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

    <div class="mb-4 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
      <el-input v-model.trim="tailWaybillSearch" type="text" placeholder="请输入第三方单号" class="!w-72" clearable />
      <el-button type="primary" :loading="tailWaybillPrintListLoading" @click="getTailWaybillPrintList">
        获取尾程面单并打印
      </el-button>
    </div>

    <el-table v-loading="loading" :data="pageData" border stripe class="result-table">
      <el-table-column label="第三方单号" min-width="180" show-overflow-tooltip>
        <template #default="{ row }">
          <span
            v-if="row.orderNo"
            class="copyable-order-no"
            role="button"
            tabindex="0"
            title="点击复制"
            @click="copyOrderText(row.orderNo)"
            @keydown.enter.prevent="copyOrderText(row.orderNo)"
          >
            {{ row.orderNo }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column prop="orderNumber" label="平台订单号" min-width="180" /> -->
      <el-table-column prop="operatorName" label="操作人" width="120" />
      <el-table-column label="下单时间" min-width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.orderTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作时间" min-width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openPrintDetail(row)">查看详情</el-button>
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

  <el-dialog v-model="detailDialogVisible" title="打印详情" width="960px" destroy-on-close>
    <el-table v-loading="detailLoading" :data="detailRecords" border stripe class="result-table" max-height="420">
      <el-table-column label="第三方平台订单号" min-width="160" show-overflow-tooltip>
        <template #default="{ row }">
          <span
            v-if="row.orderNo"
            class="copyable-order-no"
            role="button"
            tabindex="0"
            title="点击复制"
            @click="copyOrderText(row.orderNo)"
            @keydown.enter.prevent="copyOrderText(row.orderNo)"
          >
            {{ row.orderNo }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="packageId" label="物流包裹编号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="trackingNumber" label="尾程面单号" min-width="160" show-overflow-tooltip />
      <el-table-column prop="operatorName" label="操作人" width="100" />
      <el-table-column label="订单创建时间" min-width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.orderTime) }}
        </template>
      </el-table-column>
      <el-table-column label="记录创建时间" min-width="170">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
    </el-table>
    <div class="mt-4 flex justify-end">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20]"
        :total="detailTotal"
        :page-size="detailQuery.size"
        :current-page="detailQuery.current"
        @size-change="onDetailSizeChange"
        @current-change="onDetailPageChange"
      />
    </div>
  </el-dialog>

  <el-dialog v-model="printDialogVisible" title="可打印面单列表" width="960px">
    <el-table
      ref="printTableRef"
      v-loading="printListLoading"
      :data="printList"
      border
      stripe
      @selection-change="onPrintSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="waybillId" label="面单记录ID" min-width="200" />
      <el-table-column prop="printConfigUniCode" label="打印机配置编码" min-width="180" />
      <el-table-column label="配置名称" min-width="220">
        <template #default="{ row }">
          {{ printConfigNameMap.get(row.printConfigUniCode) || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="fileType" label="文件类型" width="120" />
      <el-table-column label="文件地址" min-width="240">
        <template #default="{ row }">
          <el-link :href="row.url" target="_blank" type="primary">{{ row.url }}</el-link>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="printDialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="addLoading" @click="submitAddTailWaybill">添加揽收/尾程单</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.page-card {
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

.copyable-order-no {
  cursor: pointer;
  color: var(--el-color-primary);
  text-decoration: none;
}

.copyable-order-no:hover {
  text-decoration: underline;
}
</style>
