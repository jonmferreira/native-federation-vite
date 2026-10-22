// Local shared util imported by more than one exposed module. Forces the
// bundler to emit an internal shared chunk (the @nf-internal/ case).
export function shout(text: string): string {
  return text.toUpperCase() + '!'
}
