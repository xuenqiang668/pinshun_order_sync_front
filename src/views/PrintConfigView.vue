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
  return platformList.value.find(platform => platform.platformCode === activePlatformCode.value)
})

const activeRows = computed<PlatformConfigRow[]>(() => {
  return (
    activePlatform.value?.configItemList?.map(item => ({
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
      printerOptions.value = printerList.map(item => item.name).filter(Boolean)
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
  <el-card v-loading="loading" class="print-config-page !rounded-xl !border-0">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="text-base font-semibold text-slate-800">面单打印配置</div>
        <el-tag type="info" effect="plain">平台 {{ platformList.length }} 个</el-tag>
      </div>
    </template>

    <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 pt-2">
      <el-tabs v-model="activePlatformCode">
        <el-tab-pane
          v-for="platform in platformList"
          :key="platform.platformCode"
          :label="platform.platformName"
          :name="platform.platformCode"
        />
      </el-tabs>
    </div>

    <div class="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-600">
      每个面单模板绑定一个本机打印机；清空或点击“禁用”后保存，即可停用该模板的自动打印。
    </div>

    <vxe-table :data="activeRows" border class="config-table rounded-md" empty-text="暂无配置项">
      <vxe-column field="configItemName" title="面单模板" min-width="220" show-overflow="tooltip" />
      <vxe-column title="绑定打印机" min-width="620">
        <template #default="{ row }">
          <div class="flex items-center gap-3">
            <el-select
              v-model="selectedPrinterMap[row.printConfigUniCode]"
              placeholder="请选择打印机"
              clearable
              filterable
              class="!w-[440px]"
            >
              <el-option v-for="item in printerOptions" :key="item" :label="item" :value="item" />
            </el-select>
            <el-button type="primary" plain @click="clearPrinter(row.printConfigUniCode)">禁用</el-button>
          </div>
        </template>
      </vxe-column>
    </vxe-table>

    <div class="mt-6 flex justify-center">
      <el-button type="primary" :loading="saving" @click="saveConfig">保存配置</el-button>
    </div>
  </el-card>
</template>

<style scoped>
.print-config-page {
  box-shadow: 0 8px 24px rgb(15 23 42 / 6%);
}
</style>
