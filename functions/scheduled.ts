import { boot } from './init.js'

/**
 * Be aware that no middleware runs here. boot() does the setup the middleware would.
 *
 * @param {*} c
 */
export async function scheduled(c) {
  let st = new Date(c.controller.scheduledTime)
  console.log('scheduled:', c.controller.cron, st)
  await boot(c)

  await c.data.scheduler.run(c, c.controller)
}
