import { boot } from './init.js'

/**
 * Be aware that no middleware runs here. boot() does the setup the middleware would.
 *
 * @param {*} c
 */
export async function queue(c) {
  console.log('queue called!')
  await boot(c)
  for (const message of c.batch.messages) {
    console.log('Received', message.id, message.body)
  }
}
