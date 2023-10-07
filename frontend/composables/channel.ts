import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { useAuth } from './auth'
import { useFetch } from '#app'

// remove later
interface AppChannel {

    getAllChannels: () => any // get all channels
    getChannels: () => any // get channels
    allChannelArray: globalThis.Ref<any[]> // all channel array
}

export const useChannel = defineStore('channel', () => {
    const channel: AppChannel = {} as AppChannel
    const authStore = useAuth()

    channel.getAllChannels = async () => {
        //console.log('in getAllChannels (channel.ts)')
        const { data, error } = await useRequest('/socket/getallchannels', {
            method: 'GET',
        })

        //console.log('data = ', data.value)
        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }

        return data.value
    }

    channel.getChannels = async () => {
        const { data, error } = await useRequest('/socket/getchannels', {
            method: 'POST',
            body: {
                userId: authStore.session.id,
            },
        })

        if (error.value?.statusCode) {
            authStore.error = error.value?.statusMessage as string
            return null
        }

        return data.value
    }

    return channel
})
