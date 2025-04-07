/**
 * CSS选择器常量
 */
export const SELECTORS = {
  PRODUCT_ROW: "tbody > tr",
  // 商品库对应：a.ellipsis-2
  PRODUCT_TITLE: "a.ellipsis-2",
  // 商品榜对应：  a.product-title
  NEXT_PAGE_BUTTON: ".el-pagination .btn-next:not(.is-disabled)"
} as const

/**
 * 通知消息样式
 */
export const NOTIFICATION_STYLES: React.CSSProperties = {
  position: "fixed",
  bottom: "10px",
  right: "10px",
  padding: "10px",
  background: "orange",
  color: "white",
  zIndex: "9999"
}
