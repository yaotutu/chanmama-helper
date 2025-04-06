import { SELECTORS } from "./constants"
import { getLatestProducts, saveProducts } from "./db"
import type { Product } from "./types"

interface CrawlResponse {
  success: boolean
  count?: number
  error?: string
}

/**
 * 爬取单页商品数据
 */
async function crawlSinglePage(): Promise<Product[]> {
  console.log("[Chanmama Helper] 开始爬取商品数据...")
  const products: Product[] = []

  try {
    // 等待商品表格加载
    // 随机延迟1-3秒，模拟人类阅读时间
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    )

    const rows = document.querySelectorAll(SELECTORS.PRODUCT_ROW)
    if (!rows.length) {
      throw new Error("未找到商品数据表格")
    }

    const pageProducts = Array.from(rows)
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

    products.push(...pageProducts)
    console.log(`[Chanmama Helper] 成功提取 ${pageProducts.length} 条商品数据`)
  } catch (error) {
    console.error("[Chanmama Helper] 爬取过程中发生错误:", error)
    throw error
  }

  return products
}

/**
 * 处理翻页逻辑
 */
async function handlePagination(pageLimit: number): Promise<Product[]> {
  let allProducts: Product[] = []
  let currentPage = 1

  // 添加随机起始延迟，避免立即开始爬取
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  )

  while (currentPage <= pageLimit) {
    console.log(`[Chanmama Helper] 开始爬取第 ${currentPage} 页`)
    const products = await crawlSinglePage()
    allProducts.push(...products)

    if (currentPage < pageLimit) {
      const nextButton = document.querySelector(SELECTORS.NEXT_PAGE_BUTTON)
      if (nextButton) {
        console.log(`[Chanmama Helper] 跳转到第 ${currentPage + 1} 页`)
        ;(nextButton as HTMLElement).click()
        // 随机延迟2-5秒，模拟人类翻页间隔
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 + Math.random() * 3000)
        )
        currentPage++
      } else {
        console.log("[Chanmama Helper] 没有更多页面可爬取")
        break
      }
    } else {
      currentPage++
    }
  }

  return allProducts
}

/**
 * 主爬取函数
 */
export async function crawlChanmama(pageLimit = 1): Promise<CrawlResponse> {
  try {
    const allProducts = await handlePagination(pageLimit)
    const timestamp = Date.now().toString()
    const key = await saveProducts(allProducts as Product[])
    console.log(
      `[Chanmama Helper] 商品数据已存储到数据库，key: ${key}`,
      allProducts.length
    )
    return { success: true, count: allProducts.length }
  } catch (error) {
    console.error("[Chanmama Helper] 爬取失败:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "未知错误"
    }
  }
}
