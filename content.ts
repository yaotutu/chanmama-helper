import { NOTIFICATION_STYLES } from "./constants"
import { crawlChanmama } from "./crawler"

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
 * @param pageLimit 爬取页数限制
 * @param sendResponse 可选的消息响应回调
 */
function handleCrawlRequest(
  pageLimit = 1,
  sendResponse?: (response: any) => void
) {
  if (sendResponse) {
    // 异步处理请求但立即返回true保持通道开放
    crawlChanmama(pageLimit)
      .then((response) => {
        if (response.success) {
          showNotification(`爬取成功！共 ${response.count} 条数据`)
        }
        sendResponse(response)
      })
      .catch((error) => {
        console.error("[Chanmama Helper] 爬取错误:", error)
        sendResponse({
          success: false,
          error: "处理请求时发生错误"
        })
      })
    return true // 立即返回以保持消息通道开放
  }

  // 没有sendResponse时保持原有同步逻辑
  return (async () => {
    try {
      const response = await crawlChanmama(pageLimit)
      if (response.success) {
        showNotification(`爬取成功！共 ${response.count} 条数据`)
      }
      return response
    } catch (error) {
      console.error("[Chanmama Helper] 爬取错误:", error)
      return {
        success: false,
        error: "处理请求时发生错误"
      }
    }
  })()
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
      return handleCrawlRequest(request.pageLimit, sendResponse)

    default:
      return handleUnknownAction(sendResponse)
  }
})
