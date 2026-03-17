export interface CurrentUser {
    userId: number
    username: string
    nickname: string | null
    tokenVersion: number
    roleCodes: string[]
    permissionCodes: string[]
}
