export class LoginResponseDto {
    accessToken: string
    tokenType: string
    expiresIn: string
    userInfo: {
        userId: number
        username: string
        nickname: string | null
        roleCodes: string[]
        permCodes: string[]
    }
}
