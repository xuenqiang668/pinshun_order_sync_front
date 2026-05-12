import type { CommonResult, PageResult } from '@/api/commonResult'
import { unwrapResult } from '@/api/commonResult'
import request from '@/utils/request'

/** 揽收/尾程打印查询参数，与 TemuTailWaybillPrintPageParam 对齐 */
export interface TemuTailWaybillPrintPageParam {
  /** 第三方单号 */
  orderNo?: string
  operatorId?: string
  startTime?: string
  endTime?: string
  /** 扫描单价类型：1 扫描，2 入库 */
  priceType?: number
  current?: number
  size?: number
}

/** 揽收/尾程打印分页结果，与 TemuTailWaybillPrintPageResult 对齐 */
export interface TemuTailWaybillPrintPageResult {
  id: string
  orderNo: string
  orderNumber: string
  operatorName: string
  orderTime: string
  createTime: string
}

/** 揽收/尾程打印详情结果，与 TemuTailWaybillPrintDetailResult 对齐 */
export interface TemuTailWaybillPrintDetailResult {
  id: string
  orderNo: string
  packageId: string
  trackingNumber: string
  operatorName: string
  orderTime: string
  createTime: string
}

export interface TemuTailWaybillPrintDetailPageParam {
  id: string
  current?: number
  size?: number
}

export interface WaybillPrintFileResult {
  waybillId: string
  printConfigUniCode: string
  fileType: string
  url: string
}

interface FactoryPrintConfigItemDTO {
  printConfigUniCode: string
  configItemName: string
}

export interface FactoryPrintConfigResult {
  platformCode: string
  platformName: string
  configItemList: FactoryPrintConfigItemDTO[]
}

export const getTailWaybillPageApi = async (param: TemuTailWaybillPrintPageParam) => {
  const { data } = await request.get<CommonResult<PageResult<TemuTailWaybillPrintPageResult>>>(
    '/pinshun/temu/tail/waybill/print/page',
    { params: param },
  )
  const pageData = unwrapResult(data)
  return {
    records: pageData?.records ?? pageData?.list ?? [],
    total: pageData?.total ?? 0,
  }
}

export const getTailWaybillPrintDetailPageApi = async (param: TemuTailWaybillPrintDetailPageParam) => {
  const { data } = await request.get<CommonResult<PageResult<TemuTailWaybillPrintDetailResult>>>(
    '/pinshun/temu/tail/waybill/print/detail/page',
    { params: param },
  )
  const pageData = unwrapResult(data)
  return {
    records: pageData?.records ?? pageData?.list ?? [],
    total: pageData?.total ?? 0,
  }
}

export const getTailWaybillPrintListApi = async (orderNo: string) => {
  const { data } = await request.get<CommonResult<WaybillPrintFileResult[]>>('/pinshun/temu/tail/waybill/print', {
    params: { orderNo },
  })
  return unwrapResult(data) ?? []
}

export const addTailWaybillApi = async (waybillIdList: string[]) => {
  const { data } = await request.post<CommonResult<string>>('/pinshun/tail/waybill/detail/add', {
    waybillIdList,
  })
  unwrapResult(data)
}

export const getPrintConfigListApi = async () => {
  const { data } = await request.get<CommonResult<FactoryPrintConfigResult[]>>('/pinshun/print/config/list')
  return unwrapResult(data) ?? []
}
