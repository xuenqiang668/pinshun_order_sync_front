/** 复制到剪贴板：优先 Clipboard API，失败时用 execCommand 兜底 */
export async function copyToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch {
      // 非安全上下文等场景会失败，走兜底
    }
  }

  await new Promise<void>((resolve, reject) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    ta.style.top = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    try {
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      if (ok) resolve()
      else reject(new Error('copy failed'))
    } catch (e) {
      document.body.removeChild(ta)
      reject(e instanceof Error ? e : new Error('copy failed'))
    }
  })
}
