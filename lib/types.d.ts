export type InternalBuffer = {
    buffer: Buffer,
    offset: number
}

export type BitString = {
    value: number[],
    bitsUsed: number
  }