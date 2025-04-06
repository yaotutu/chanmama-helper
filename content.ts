import { Storage } from "@plasmohq/storage"

const storage = new Storage()

interface Product {
  title: string
  link: string
  price?: string
  sales?: number
}

const SELECTORS = {
  PRODUCT_ROW: "tbody > tr",
  PRODUCT_TITLE: "a.product-title",
  NEXT_PAGE_BUTTON: ".el-pagination .btn-next:not(.is-disabled)"
}

const NOTIFICATION_STYLES = {
  position: "fixed",
  bottom: "10px",
  right: "10px",
  padding: "10px",
  background: "orange",
  color: "white",
  zIndex: "9999"
}

async function crawlChanmama(): Promise<Product[]> {
  console.log("[Chanmama Helper] 开始爬取商品数据...")
  const allProducts: Product[] = []
  let pageNum = 1

  try {
    // 等待商品表格加载
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const rows = document.querySelectorAll(SELECTORS.PRODUCT_ROW)
    if (!rows.length) {
      throw new Error("未找到商品数据表格")
    }

    const products = Array.from(rows)
      .map((row) => {
        const titleLink = row.querySelector<HTMLAnchorElement>(
          SELECTORS.PRODUCT_TITLE
        )
        if (!titleLink) return null

        return {
          title: titleLink.textContent?.trim() || "",
          link: titleLink.href
        }
      })
      .filter(Boolean) as Product[]

    allProducts.push(...products)
    console.log(`[Chanmama Helper] 成功提取 ${products.length} 条商品数据`)
  } catch (error) {
    console.error("[Chanmama Helper] 爬取过程中发生错误:", error)
  }

  return allProducts
}

function showNotification(message: string): void {
  const notification = document.createElement("div")
  notification.textContent = message
  Object.assign(notification.style, NOTIFICATION_STYLES)
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "popup-clicked":
      showNotification("👋 蝉妈妈助手已激活！")
      sendResponse({ success: true })
      break

    case "start-crawl":
      ;(async () => {
        try {
          const products = await crawlChanmama()
          await storage.set("products", JSON.stringify(products))
          sendResponse({ success: true, count: products.length })
        } catch (error) {
          console.error("[Chanmama Helper] 爬取失败:", error)
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : "未知错误"
          })
        }
      })()
      return true // 保持消息通道开放

    default:
      sendResponse({ success: false, error: "未知操作类型" })
  }
})
