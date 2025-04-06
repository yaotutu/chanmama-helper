import { useState } from "react"

export default function IndexPopup() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [productCount, setProductCount] = useState(0)

  const callContentFunction = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      chrome.tabs.sendMessage(tab.id, { action: "popup-clicked" })
    } catch (error) {
      setResult("Error: " + error.message)
    }
  }

  const startCrawling = async () => {
    setIsLoading(true)
    setResult("开始爬取蝉妈妈商品数据...")

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      // 设置5秒超时
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("请求超时")), 5000)
      )

      try {
        const response = await Promise.race([
          chrome.tabs.sendMessage(tab.id, { action: "start-crawl" }),
          timeout
        ])

        if (response?.success) {
          setResult("爬取成功")
          setProductCount(response.count)
          console.log("爬取结果:", response)
        } else {
          setResult(`爬取失败: ${response?.error || "未知错误"}`)
        }
      } catch (error) {
        setResult(`爬取失败: ${error.message}`)
      }
    } catch (error) {
      setResult("爬取失败: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: 16, width: 300 }}>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={callContentFunction}
          style={{ padding: "8px 16px", marginRight: 8 }}
          disabled={isLoading}>
          测试连接
        </button>
        <button
          onClick={startCrawling}
          style={{ padding: "8px 16px", background: "#4CAF50", color: "white" }}
          disabled={isLoading}>
          {isLoading ? "爬取中..." : "开始爬取"}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        <div>状态: {result}</div>
        {productCount > 0 && (
          <div style={{ marginTop: 8 }}>
            已爬取商品数: <strong>{productCount}</strong>
          </div>
        )}
      </div>
    </div>
  )
}
