export class UserListResponseDto {
    id: number
    username: string
    nickname: string | null
    phone: string | null
    status: number
    roleCodes: string[]
}
