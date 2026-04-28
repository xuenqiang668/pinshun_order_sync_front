type PrintParamConfig = {
  page: { width: number; height: number }
  img: { left: number; top: number; width: string; height: string }
  scale: number
}

export const printParamsConfig: Record<string, PrintParamConfig> = {
  'TEMU_Y2#WAYBILL': {
    page: { width: 1050, height: 1560 },
    img: { left: 10, top: 5, width: '93%', height: '95%' },
    scale: 15, // 图片缩放，数字越大图片质量越高
  },
}
