export class UserDetailResponseDto {
    id: number
    username: string
    nickname: string | null
    phone: string | null
    status: number
    roleIds: number[]
}
