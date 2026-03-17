export class PermissionListResponseDto {
    id: number
    permCode: string
    permName: string
    permType: number
    path: string | null
    method: string | null
    status: number
}
