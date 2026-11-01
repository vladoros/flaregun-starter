import { MAX_JSON_CHARS } from '../utils.js'

// Define your models as classes with a static properties attribute:
export class Product {
  static properties = {
    id: {
      type: String,
      primaryKey: true,
    },
    userId: {
      type: String,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    data: {
      type: Object, // this will be stored as a JSON object so you can stuff anything in here and still query on it.
    },
  }
}

export const SAMPLE_PRODUCTS = [
  {
    name: 'Wireless Studio Headphones',
    description: 'Active noise-canceling over-ear headphones with 40-hour battery life and spatial audio.',
    price: 249.99,
    data: {
      category: 'electronics',
      inStock: true,
      discount: 15,
    },
  },
  {
    name: 'Mechanical Split Keyboard',
    description: 'Hot-swappable ergonomic mechanical keyboard with custom tactile switches and RGB underglow.',
    price: 179.0,
    data: {
      category: 'electronics',
      inStock: true,
      discount: 0,
    },
  },
  {
    name: 'Cloudflare Edge Architecture Guide',
    description: 'Comprehensive handbook on building globally distributed applications with Workers, D1, R2, and KV.',
    price: 39.5,
    data: {
      category: 'books',
      inStock: true,
      discount: 10,
    },
  },
  {
    name: 'Minimalist Desk Mat',
    description: 'Water-resistant merino wool felt and vegan leather desk pad for a clean workspace.',
    price: 45.0,
    data: {
      category: 'accessories',
      inStock: false,
      discount: 0,
    },
  },
]

export async function seedProducts(c) {
  try {
    const count = await c.data.d1.count(Product, { where: { userId: null } })
    if (count === 0) {
      // Fixed ids make a concurrent seed from another isolate fail on the primary key instead of duplicating.
      for (const [i, item] of SAMPLE_PRODUCTS.entries()) {
        await c.data.d1.insert(Product, { ...item, id: `seed-${i}`, userId: null })
      }
    }
  } catch (err) {
    c.data.logger.error('Failed to seed products', err)
  }
}

/**
 * Server-side limits that match the form: returns a message for a bad payload, or null.
 * Pass only the fields being written.
 */
export function productError(f: { name?: string; description?: string; price?: number; data?: any }) {
  if (f.name !== undefined && f.name.length > 200) return 'Product name is too long (max 200 characters)'
  if (f.description !== undefined && f.description.length > 2000) {
    return 'Product description is too long (max 2000 characters)'
  }
  if (f.price !== undefined && !(f.price >= 0 && f.price <= 1_000_000)) return 'Price must be between 0 and 1,000,000'
  if (f.data !== undefined) {
    if (JSON.stringify(f.data).length > MAX_JSON_CHARS) return 'Product data is too large'
    const discount = f.data.discount
    if (discount !== undefined && !(Number(discount) >= 0 && Number(discount) <= 100)) {
      return 'Discount must be between 0 and 100'
    }
  }
  return null
}

export async function getProducts(c, q: Record<string, any> = {}) {
  const userId = c.data.user?.id || null
  const where = Array.isArray(q.where)
    ? [['userId', '=', userId], ...q.where]
    : { ...(q.where || {}), userId }
  const query = {
    order: ['createdAt', 'desc'],
    ...q,
    where,
  }
  return await c.data.d1.query(Product, query)
}

export async function getProduct(c, id) {
  const product = await c.data.d1.get(Product, id)
  if (!product) return null
  if (product.userId && product.userId !== c.data.user?.id) {
    return null
  }
  return product
}
