/**
 * 当前是否为非 development 模式（生产/预发等构建）。
 * 与 `vite.config.ts` 里 `mode !== 'development'` 的约定保持一致。
 */
export const isProdMode = import.meta.env.MODE !== 'development'
