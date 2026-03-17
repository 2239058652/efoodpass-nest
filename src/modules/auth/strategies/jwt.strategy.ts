import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthService } from '../auth.service'
import type { CurrentUser } from '../../../common/interfaces/current-user.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('jwt.secret', ''),
        })
    }

    async validate(payload: {
        userId: number
        username: string
        nickname?: string | null
        tokenVersion: number
    }): Promise<CurrentUser> {
        return this.authService.validateJwtUser(payload)
    }
}
