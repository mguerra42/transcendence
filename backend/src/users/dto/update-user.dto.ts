export interface UpdateUserDto {
    email?: string;
    password?: string;
    username?: string;
    avatarPath?: string;
    socketId?: string;
    status?: string;
    twoFa?:number;
}
