<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getPrintConfigListApi, type FactoryPrintConfigResult } from '@/api/tailWaybill'
import { getPrintConfig, getPrinterList, setPrintConfig } from '@/utils/print'

interface PlatformConfigRow {
  printConfigUniCode: string
  configItemName: string
}

const loading = ref(false)
const saving = ref(false)
const platformList = ref<FactoryPrintConfigResult[]>([])
const activePlatformCode = ref('')
const printerOptions = ref<string[]>([])
const selectedPrinterMap = ref<Record<string, string>>({})

const activePlatform = computed(() => {
  return platformList.value.find((platform) => platform.platformCode === activePlatformCode.value)
})

const activeRows = computed<PlatformConfigRow[]>(() => {
  return (
    activePlatform.value?.configItemList?.map((item) => ({
      printConfigUniCode: item.printConfigUniCode,
      configItemName: item.configItemName,
    })) ?? []
  )
})

const loadPageData = async () => {
  loading.value = true
  try {
    const [platforms] = await Promise.all([getPrintConfigListApi()])
    platformList.value = platforms ?? []

    if (!activePlatformCode.value && platformList.value.length > 0) {
      activePlatformCode.value = platformList.value[0].platformCode
    }

    selectedPrinterMap.value = getPrintConfig() ?? {}

    try {
      const printerList = getPrinterList()
      printerOptions.value = printerList.map((item) => item.name).filter(Boolean)
    } catch (error) {
      printerOptions.value = []
      ElMessage.warning(error instanceof Error ? error.message : '获取本机打印机列表失败')
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '获取打印配置失败')
  } finally {
    loading.value = false
  }
}

const clearPrinter = (code: string) => {
  selectedPrinterMap.value[code] = ''
}

const saveConfig = async () => {
  saving.value = true
  try {
    const compactMap = Object.fromEntries(
      Object.entries(selectedPrinterMap.value).filter(([, printerName]) => Boolean(printerName)),
    )
    setPrintConfig(compactMap)
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadPageData()
})
</script>

<template>
  <el-card v-loading="loading" class="print-config-page">
    <template #header>
      <div class="text-lg font-semibold">面单打印配置</div>
    </template>

    <el-tabs v-model="activePlatformCode" class="mb-4">
      <el-tab-pane
        v-for="platform in platformList"
        :key="platform.platformCode"
        :label="platform.platformName"
        :name="platform.platformCode"
      />
    </el-tabs>

    <el-table :data="activeRows" border>
      <el-table-column prop="configItemName" label="面单" min-width="220" />
      <el-table-column label="打印机列表" min-width="580">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <el-select
              v-model="selectedPrinterMap[row.printConfigUniCode]"
              placeholder="请选择打印机"
              clearable
              filterable
              class="!w-[420px]"
            >
              <el-option v-for="item in printerOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-button type="primary" plain @click="clearPrinter(row.printConfigUniCode)"
              >禁用</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-6 flex justify-center">
      <el-button type="primary" :loading="saving" @click="saveConfig">保存</el-button>
    </div>
  </el-card>
</template>
