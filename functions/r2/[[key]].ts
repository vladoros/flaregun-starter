import { APIError } from 'api'

/**
 * This is for serving files from local R2 since there is nothing built-in to handle this.
 *
 * @param {*} c
 * @returns
 */
export async function onRequestGet(c) {
  console.log('GET R2:', c.params.key)
  // flaregun already URL-decoded the params, so decoding again would throw on a literal %
  const key = c.params.key.join('/')
  const file = await c.env.R2.get(key)
  if (!file) throw new APIError('file not found', { status: 404 })
  const headers = new Headers()
  headers.append('etag', file.httpEtag)
  headers.set('x-content-type-options', 'nosniff')
  // Avatar keys contain a random id and are never overwritten.
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  headers.set('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox")
  if (file.httpMetadata?.contentType) {
    headers.set('content-type', file.httpMetadata.contentType)
  }
  return new Response(file.body, {
    headers,
  })
}
