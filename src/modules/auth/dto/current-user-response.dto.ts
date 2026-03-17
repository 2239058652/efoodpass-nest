export class CurrentUserResponseDto {
    userId: number
    username: string
    nickname: string | null
    roleCodes: string[]
    permissionCodes: string[]
}
