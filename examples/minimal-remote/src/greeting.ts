// A framework-agnostic exposed module. Exercises an external shared dep
// (date-fns) and a local util shared with another exposed module (util.ts),
// which forces the bundler to emit an internal shared chunk.
import { formatDistanceToNow } from 'date-fns'

import { shout } from './util'

export function greet(name: string): string {
  return shout(`Hello, ${name}`)
}

export function since(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true })
}
