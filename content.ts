import { Storage } from "@plasmohq/storage"

import { NOTIFICATION_STYLES } from "./constants"
import { crawlChanmama } from "./crawler"

const storage = new Storage()

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
/**
 * 处理爬取请求
 */
async function handleCrawlRequest(pageLimit = 1) {
  const response = await crawlChanmama(pageLimit)
  if (response.success) {
    showNotification(`爬取成功！共 ${response.count} 条数据`)
  }
  return response
}

/**
 * 处理开始爬取消息
 */
function handleStartCrawl(
  pageLimit: number,
  sendResponse: (response: any) => void
) {
  handleCrawlRequest(pageLimit)
    .then((response) => sendResponse(response))
    .catch((error) => {
      console.error("[Chanmama Helper] 消息处理错误:", error)
      sendResponse({
        success: false,
        error: "处理请求时发生错误"
      })
    })
  return true // 保持消息通道开放
}

/**
 * 处理未知操作类型
 */
function handleUnknownAction(sendResponse: (response: any) => void) {
  sendResponse({ success: false, error: "未知操作类型" })
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "start-crawl":
      return handleStartCrawl(request.pageLimit, sendResponse)

    default:
      return handleUnknownAction(sendResponse)
  }
})
