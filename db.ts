import Dexie from "dexie"

import type { Product } from "./types"

const db = new Dexie("ChanmamaDB")
db.version(1).stores({
  products: "++key" // 自增主键
})

const productsTable = db.table<{ key?: number; data: Product[] }, number>(
  "products"
)

/**
 * 存储商品数据
 * @param products 商品数据数组
 * @returns 返回生成的存储key(时间戳)
 */
export async function saveProducts(products: Product[]): Promise<number> {
  // 验证数据
  if (!Array.isArray(products)) {
    throw new Error("商品数据必须是数组")
  }

  for (const product of products) {
    if (!product.title || !product.link) {
      throw new Error("每个商品必须包含title和link字段")
    }
  }

  try {
    const key = Date.now()
    await productsTable.add({
      key,
      data: products
    })
    console.log(
      `[Chanmama DB] 成功存储 ${products.length} 条商品数据，key: ${key}`
    )
    return key
  } catch (error) {
    console.error("[Chanmama DB] 存储失败:", error)
    throw error
  }
}

/**
 * 根据key获取商品数据
 * @param key 存储时使用的key
 * @returns 商品数据数组
 */
export async function getProductsByKey(key: number): Promise<Product[] | null> {
  const record = await productsTable.get(key)
  return record?.data ?? null
}

/**
 * 获取最近存储的商品数据
 * @returns 最近一次存储的商品数据数组
 */
export async function getLatestProducts(): Promise<Product[] | null> {
  const record = await productsTable.orderBy("key").reverse().first()
  return record?.data ?? null
}

/**
 * 清空所有商品数据
 */
export async function clearAllProducts(): Promise<void> {
  await productsTable.clear()
}
