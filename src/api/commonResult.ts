export interface PageResult<T> {
  records?: T[]
  list?: T[]
  total?: number
}

export interface CommonResult<T> {
  code?: number
  msg?: string
  message?: string
  data?: T
}

export const unwrapResult = <T>(result: CommonResult<T>): T => {
  const success = result.code === undefined || result.code === 0 || result.code === 200
  if (!success) {
    throw new Error(result.msg || result.message || '请求失败')
  }
  return result.data as T
}
