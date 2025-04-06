import { useState } from "react"

import { NOTIFICATION_STYLES } from "./constants"

interface CrawlResponse {
  success: boolean
  count?: number
  error?: string
}

/**
 * 按钮组件
 */
const Button = ({
  onClick,
  disabled,
  children,
  color = "#4CAF50"
}: {
  onClick: () => void
  disabled: boolean
  children: React.ReactNode
  color?: string
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 16px",
      background: color,
      color: "white",
      border: "none",
      borderRadius: 4,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1
    }}
    disabled={disabled}>
    {children}
  </button>
)

/**
 * 状态显示组件
 */
const StatusDisplay = ({
  result,
  productCount
}: {
  result: string
  productCount: number
}) => (
  <div style={{ marginTop: 16 }}>
    <div>状态: {result}</div>
    {productCount > 0 && (
      <div style={{ marginTop: 8 }}>
        已爬取商品数: <strong>{productCount}</strong>
      </div>
    )}
  </div>
)

/**
 * 主弹出窗口组件
 */
export default function IndexPopup() {
  const [result, setResult] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [productCount, setProductCount] = useState(0)

  /**
   * 测试与内容脚本的连接
   */
  const testConnection = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      await chrome.tabs.sendMessage(tab.id, { action: "popup-clicked" })
      setResult("连接测试成功")
    } catch (error) {
      setResult(`连接失败: ${error.message}`)
    }
  }

  /**
   * 开始爬取商品数据
   */
  const startCrawling = async () => {
    setIsLoading(true)
    setResult("开始爬取蝉妈妈商品数据...")

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const response = (await Promise.race([
        chrome.tabs.sendMessage(tab.id, { action: "start-crawl" }),
        new Promise<CrawlResponse>((_, reject) =>
          setTimeout(() => reject(new Error("请求超时")), 5000)
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
    <div
      style={{
        padding: 16,
        width: 300,
        fontFamily: "Arial, sans-serif"
      }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16
        }}>
        <Button onClick={testConnection} disabled={isLoading} color="#2196F3">
          测试连接
        </Button>
        <Button onClick={startCrawling} disabled={isLoading}>
          {isLoading ? "爬取中..." : "开始爬取"}
        </Button>
      </div>

      <StatusDisplay result={result} productCount={productCount} />
    </div>
  )
}
