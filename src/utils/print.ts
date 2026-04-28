import { printParamsConfig } from './print.config'

type LodopValue = number | string

interface PrintLayoutConfig {
  page: {
    width: LodopValue
    height: LodopValue
  }
  img: {
    top: LodopValue
    left: LodopValue
    width: LodopValue
    height: LodopValue
  }
}

type PrinterConfigMap = Record<string, string>

interface LodopPrinter {
  name: string
}

interface LodopInstance {
  SET_PRINT_PAGESIZE(orient: number, pageWidth: LodopValue, pageHeight: LodopValue): void
  SET_PRINTER_INDEXA(index: number): void
  ADD_PRINT_PDF(
    top: LodopValue,
    left: LodopValue,
    width: LodopValue,
    height: LodopValue,
    content: string,
  ): void
  ADD_PRINT_IMAGE(
    top: LodopValue,
    left: LodopValue,
    width: LodopValue,
    height: LodopValue,
    content: string,
  ): void
  SET_PRINT_STYLEA(index: number, styleName: string, value: LodopValue | boolean): void
  PRINT(): void
  Printers: {
    list: LodopPrinter[]
  }
}

declare global {
  interface Window {
    getLodop?: () => LodopInstance
  }
}

function getLodopInstance(): LodopInstance | null {
  return window.getLodop ? window.getLodop() : null
}

function requirePrintConfigMap(): PrinterConfigMap {
  const config = getPrintConfig()
  if (!config) {
    throw new Error('请先配置打印参数')
  }
  return config
}

function applyLodopPrintConfig(
  printerName: string,
  config: PrintLayoutConfig,
): LodopInstance | null {
  const lodop = getLodopInstance()
  if (!lodop) return null

  lodop.SET_PRINT_PAGESIZE(1, config.page.width, config.page.height)

  const printerList = getPrinterList()
  const printIndex = printerList.findIndex((item) => item.name === printerName)
  if (printIndex < 0) {
    throw new Error(`未找到打印机: ${printerName}`)
  }
  lodop.SET_PRINTER_INDEXA(printIndex)
  return lodop
}

function downloadPdfAsBase64(url: string): string {
  if (!/^https?:/i.test(url)) {
    throw new Error('pdfUrl 必须为 http/https 地址')
  }

  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, false)

  let isArrayBuffer = false
  if (xhr.overrideMimeType) {
    try {
      xhr.responseType = 'arraybuffer'
      isArrayBuffer = true
    } catch {
      xhr.overrideMimeType('text/plain; charset=x-user-defined')
    }
  }

  xhr.send(null)
  const data = xhr.response || (xhr as XMLHttpRequest & { responseBody?: unknown }).responseBody
  if (!data) {
    throw new Error('下载 PDF 失败，返回内容为空')
  }

  let dataArray: Uint8Array
  if (typeof Uint8Array !== 'undefined') {
    if (isArrayBuffer) {
      dataArray = new Uint8Array(data as ArrayBuffer)
    } else {
      const text = data as string
      dataArray = new Uint8Array(text.length)
      for (let i = 0; i < dataArray.length; i += 1) {
        dataArray[i] = text.charCodeAt(i)
      }
    }
  } else {
    throw new Error('当前环境不支持 Uint8Array，无法处理 PDF 打印')
  }

  return toBase64(dataArray)
}

function toBase64(dataArray: Uint8Array): string {
  const digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  let result = ''

  for (let i = 0; i < dataArray.length; i += 3) {
    if (Number.isNaN(dataArray[i])) break

    const b1 = dataArray[i] & 0xff
    const b2 = dataArray[i + 1] & 0xff
    const b3 = dataArray[i + 2] & 0xff

    const d1 = b1 >> 2
    const d2 = ((b1 & 3) << 4) | (b2 >> 4)
    const d3 = i + 1 < dataArray.length ? ((b2 & 0xf) << 2) | (b3 >> 6) : 64
    const d4 = i + 2 < dataArray.length ? b3 & 0x3f : 64

    result +=
      digits.substring(d1, d1 + 1) +
      digits.substring(d2, d2 + 1) +
      digits.substring(d3, d3 + 1) +
      digits.substring(d4, d4 + 1)
  }

  return result
}

export async function printDocument(
  url: string,
  fileType: string,
  printConfigUniCode: string,
): Promise<void> {
  const paramsConfig = printParamsConfig[printConfigUniCode]

  if (!paramsConfig) {
    throw new Error(`Server Error: ${printConfigUniCode} 配置不存在`)
  }

  if (!url) {
    throw new Error('必须传入url地址')
  }

  if (!printConfigUniCode) {
    throw new Error('必须传入 printConfigUniCode')
  }

  if (!fileType) {
    throw new Error('必须传入文件类型 fileType')
  }

  const printConfigMap = requirePrintConfigMap()
  const printerName = printConfigMap[printConfigUniCode]
  if (!printerName) {
    throw new Error(`${printConfigUniCode}面单没有配置打印参数`)
  }

  if (fileType.includes('image')) {
    printImage(url, printerName, paramsConfig)
    return
  }

  await printPdf(url, printerName, paramsConfig)
}

export async function printPdf(
  pdfUrl: string,
  printerName: string,
  config: PrintLayoutConfig,
): Promise<void> {
  const lodop = applyLodopPrintConfig(printerName, config)
  if (!lodop) {
    throw new Error('未检测到 Lodop，请先引入 lodop.js')
  }
  lodop.ADD_PRINT_PDF(
    config.img.top,
    config.img.left,
    config.img.width,
    config.img.height,
    downloadPdfAsBase64(pdfUrl),
  )
  lodop.PRINT()
}

export function printImage(imgUrl: string, printerName: string, config: PrintLayoutConfig): void {
  const lodop = applyLodopPrintConfig(printerName, config)
  if (!lodop) {
    throw new Error('未检测到 Lodop，请先引入 lodop.js')
  }

  lodop.ADD_PRINT_IMAGE(
    config.img.top,
    config.img.left,
    config.img.width,
    config.img.height,
    `<img src="${imgUrl}" alt="" />`,
  )
  lodop.SET_PRINT_STYLEA(0, 'Stretch', 1)
  lodop.SET_PRINT_STYLEA(0, 'FitWindow', true)
  lodop.PRINT()
}

export function getPrinterList(): LodopPrinter[] {
  const lodop = getLodopInstance()
  if (!lodop) {
    throw new Error('必须先引入 lodop.js')
  }
  return lodop.Printers.list ?? []
}

export function setPrintConfig(value: PrinterConfigMap): void {
  localStorage.setItem('print-config', JSON.stringify(value))
}

export function getPrintConfig(): PrinterConfigMap | null {
  const raw = localStorage.getItem('print-config')
  if (!raw) return null
  try {
    return JSON.parse(raw) as PrinterConfigMap
  } catch {
    return null
  }
}
