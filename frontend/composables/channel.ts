import { defineStore } from 'pinia'
import { useFetch } from '#app'
import { io } from 'socket.io-client'
import { useAuth } from './auth'

interface AppChannel {

    getAllChannels: () => any // get all channels
}

export const useChannel = defineStore('channel', () => {
    const channel: AppChannel = {} as AppChannel
    const authStore = useAuth()

    channel.getAllChannels = async () => {
        //console.log('enter in channel.getAllChannels')

        const { data, error } = await useRequest('/socket/getallchannels', {
            method: 'GET',
        })

        if (error.value?.statusCode) {
            //console.log('error in channel.getAllChannels')
            authStore.error = error.value?.statusMessage as string
            return null
        }

        console.log('in channel.getAllChannels, data = ', data)
        return data.value
    }

    return channel
})
