// Second exposed module that also imports the local util, so `shout` becomes
// internal shared code across two exposed entries.
import { shout } from './util'

export function label(count: number): string {
  return shout(`count is ${count}`)
}
