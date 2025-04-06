import { Storage } from "@plasmohq/storage"

const storage = new Storage()

interface Product {
  title: string
  link: string
}

async function crawlChanmama(): Promise<Product[]> {
  console.log("开始爬取蝉妈妈商品数据...")
  const allProducts: Product[] = []
  let hasNextPage = true
  let pageNum = 1

  while (hasNextPage) {
    console.log(`正在处理第 ${pageNum} 页...`)

    // 等待商品表格加载
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const products = Array.from(document.querySelectorAll("tbody > tr"))
      .map((row) => {
        // const nameElement = row.querySelector("a.ellipsis-2")
        // const linkElement = row.querySelector("a.img-box")
        const titleLink = row.querySelector("a.product-title") as any
        const title = titleLink?.textContent.trim() || ""
        const link = titleLink?.href || ""

        return title && link
          ? {
              title,
              link
            }
          : null
      })
      .filter(Boolean) as Product[]
    // 打印products
    products.forEach((product) => {
      console.log("商品标题:", product.title)
      console.log("商品链接:", product.link)
    })

    allProducts.push(...products)
    console.log(`第 ${pageNum} 页提取到 ${products.length} 条商品数据`)
    hasNextPage = false
    // 检查是否有下一页
    // const nextBtn = document.querySelector(
    //   ".el-pagination .btn-next:not(.is-disabled)"
    // )
    // if (nextBtn) {
    //   ;(nextBtn as HTMLElement).click()
    //   pageNum++
    //   await new Promise((resolve) => setTimeout(resolve, 2000)) // 等待页面加载
    // } else {
    //   hasNextPage = false
    //   console.log("已到达最后一页")
    // }
  }

  return allProducts
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "popup-clicked") {
    const div = document.createElement("div")
    div.textContent = "👋 蝉妈妈助手已激活！"
    div.style.position = "fixed"
    div.style.bottom = "10px"
    div.style.right = "10px"
    div.style.padding = "10px"
    div.style.background = "orange"
    div.style.color = "white"
    div.style.zIndex = "9999"
    document.body.appendChild(div)
  }

  if (request.action === "start-crawl") {
    try {
      const products = await crawlChanmama()
      console.log("爬取完成，共获取商品:", products.length)

      // 存储数据并发送回popup
      // await chrome.storage.local.set({ products })
      await storage.set("start-crawl", JSON.stringify(products))

      sendResponse({ success: true, count: products.length })
    } catch (error) {
      console.error("爬取失败:", error)
      sendResponse({ success: false, error: error.message })
    }
    return true // 保持消息通道开放用于异步响应
  }
})
