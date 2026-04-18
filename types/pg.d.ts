declare module "pg" {
  export class Pool {
    constructor(config?: unknown)

    query<Row = Record<string, unknown>>(
      text: string,
      params?: unknown[]
    ): Promise<{
      rows: Row[]
      rowCount: number | null
    }>
  }
}
