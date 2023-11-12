export interface UpdateUserDto {
    email?: string;
    password?: string;
    username?: string;
    avatar?: string;
    socketId?: string;
    status?: string;
    twoFa?: number;
}
