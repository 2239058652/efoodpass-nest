export interface CurrentUser {
    userId: number
    username: string
    status: number
    tokenVersion: number
    roleCodes: string[]
    permCodes: string[]
}
