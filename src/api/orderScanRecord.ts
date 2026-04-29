import request from '@/utils/request'

export interface TemuOrderScanRecordParam {
  startTime?: string
  endTime?: string
  current?: number
  size?: number
}

export interface TemuOrderScanRecordResult {
  id: string
  orderNo: string
  createTime: string
  createUserName: string
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

export const getOrderScanRecordPageApi = async (param: TemuOrderScanRecordParam) => {
  const { data } = await request.get<CommonResult<PageResult<TemuOrderScanRecordResult>>>(
    '/pinshun/order/scan/record/page',
    { params: param },
  )
  const pageData = unwrapResult(data)
  return {
    records: pageData?.records ?? pageData?.list ?? [],
    total: pageData?.total ?? 0,
  }
}
