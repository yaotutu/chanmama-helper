import { useState } from "react"

interface CrawlResponse {
  success: boolean
  count?: number
  error?: string
}

export default function IndexPopup() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [productCount, setProductCount] = useState(0)
  const [pageLimit, setPageLimit] = useState(1)

  const startCrawling = async () => {
    setIsLoading(true)
    setResult("开始爬取蝉妈妈商品数据...")

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const response = (await Promise.race([
        chrome.tabs.sendMessage(tab.id, {
          action: "start-crawl",
          pageLimit
        }),
        new Promise<CrawlResponse>((_, reject) =>
          setTimeout(() => reject(new Error("请求超时")), 99000)
        )
      ])) as CrawlResponse

      if (response.success) {
        setResult("爬取成功")
        setProductCount(response.count || 0)
      } else {
        setResult(`爬取失败: ${response.error || "未知错误"}`)
      }
    } catch (error) {
      setResult(`爬取失败: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: 16, width: 300, fontFamily: "Arial, sans-serif" }}>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={startCrawling}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.6 : 1,
            width: "100%",
            marginBottom: 8
          }}>
          {isLoading ? "爬取中..." : "开始爬取"}
        </button>

        <div style={{ marginTop: 8 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            爬取页数限制:
          </label>
          <input
            type="number"
            min="1"
            value={pageLimit}
            onChange={(e) =>
              setPageLimit(Math.max(1, parseInt(e.target.value) || 1))
            }
            style={{
              width: "100%",
              padding: "4px 8px",
              border: "1px solid #ccc",
              borderRadius: 4
            }}
          />
        </div>
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
