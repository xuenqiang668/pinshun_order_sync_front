import request from '@/utils/request'

export interface TailWaybillPrintDetailPageParam {
  search?: string
  startTime?: string
  endTime?: string
  current?: number
  size?: number
}

export interface TailWaybillPrintDetailPageResult {
  orderNo: string
  packageId: string
  tailTrackingNumber: string
  operatorName: string
  orderTime: string
  pickupTime: string
  createTime: string
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

interface PageResult<T> {
  records?: T[]
  list?: T[]
  total?: number
}

interface CommonResult<T> {
  code?: number
  msg?: string
  message?: string
  data?: T
}

const unwrapResult = <T>(result: CommonResult<T>): T => {
  const success = result.code === undefined || result.code === 0 || result.code === 200
  if (!success) {
    throw new Error(result.msg || result.message || '请求失败')
  }
  return result.data as T
}

export const getTailWaybillPageApi = async (param: TailWaybillPrintDetailPageParam) => {
  const { data } = await request.get<CommonResult<PageResult<TailWaybillPrintDetailPageResult>>>(
    '/pinshun/tail/waybill/detail/print/page',
    { params: param },
  )
  const pageData = unwrapResult(data)
  return {
    records: pageData?.records ?? pageData?.list ?? [],
    total: pageData?.total ?? 0,
  }
}

export const getTailWaybillPrintListApi = async (search: string) => {
  const { data } = await request.get<CommonResult<WaybillPrintFileResult[]>>(
    '/pinshun/tail/waybill/detail/print',
    {
      params: { search },
    },
  )
  return unwrapResult(data) ?? []
}

export const addTailWaybillApi = async (waybillIdList: string[]) => {
  const { data } = await request.post<CommonResult<string>>('/pinshun/tail/waybill/detail/add', {
    waybillIdList,
  })
  unwrapResult(data)
}

export const getPrintConfigListApi = async () => {
  const { data } = await request.get<CommonResult<FactoryPrintConfigResult[]>>(
    '/pinshun/print/config/list',
  )
  return unwrapResult(data) ?? []
}
