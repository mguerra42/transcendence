import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

export const useSocket = defineStore('socket', () => {
    const socket = ref()
    const auth = useAuth()

    const disconnect = async () => {
        if (auth.logged === true)
        {
            socket.value.disconnect()
        }
    }

    const connect = async () => {
        socket.value = io('http://localhost:3001', {
            withCredentials: true,
        })
    }

    const emit = (event: string, data: any) => {
        if (!socket.value)
            return console.error('Socket not connected')
        socket.value.emit(event, data)
    }

    const on = (event: string, callback: (data: any) => void) => {
        if (!socket.value)
            return console.error('Socket not connected')
        socket.value.on(event, callback)
    }

    return {
        disconnect,
        connect,
        emit,
        on,
    }
})
