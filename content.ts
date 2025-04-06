import { Storage } from "@plasmohq/storage"

import { NOTIFICATION_STYLES, SELECTORS } from "./constants"

const storage = new Storage()

/**
 * 爬取响应接口
 */
interface CrawlResponse {
  success: boolean
  count?: number
  error?: string
}

/**
 * 商品数据接口
 */
interface Product {
  title: string
  link: string
  price?: string
  sales?: number
}

/**
 * 爬取蝉妈妈商品数据
 * @returns 返回爬取到的商品数组
 */
async function crawlChanmama(): Promise<Product[]> {
  console.log("[Chanmama Helper] 开始爬取商品数据...")
  const allProducts: Product[] = []

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
    throw error // 重新抛出错误以便上层处理
  }

  return allProducts
}

/**
 * 显示通知消息
 * @param message 要显示的消息内容
 */
function showNotification(message: string): void {
  const notification = document.createElement("div")
  notification.textContent = message
  Object.assign(notification.style, NOTIFICATION_STYLES)
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const handleCrawlRequest = async (): Promise<CrawlResponse> => {
    try {
      const products = await crawlChanmama()
      await storage.set("products", JSON.stringify(products))
      console.log(
        "[Chanmama Helper] 商品数据已存储到本地存储",
        JSON.stringify(products)
      )
      showNotification("爬取成功！")
      return { success: true, count: products.length }
    } catch (error) {
      console.error("[Chanmama Helper] 爬取失败:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "未知错误"
      }
    }
  }

  switch (request.action) {
    case "popup-clicked":
      showNotification("👋 蝉妈妈助手已激活！")
      sendResponse({ success: true })
      break

    case "start-crawl":
      handleCrawlRequest()
        .then((response) => sendResponse(response))
        .catch((error) => {
          console.error("[Chanmama Helper] 消息处理错误:", error)
          sendResponse({
            success: false,
            error: "处理请求时发生错误"
          })
        })
      return true // 保持消息通道开放

    default:
      sendResponse({ success: false, error: "未知操作类型" })
  }
})
