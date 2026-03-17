export class CurrentUserResponseDto {
    userId: number
    username: string
    nickname: string | null
    status: number
    tokenVersion: number
    roleCodes: string[]
    permCodes: string[]
}
