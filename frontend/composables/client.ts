// Le client est un objet qui contient toutes les fonctions de l'app.
// Il peut être utilisé partout dans la partie front pour interagir avec les différents composants.
// Vous pouvez ajouter des fonctions ici pour les rendre accessibles partout dans l'app, mais ne supprimez pas les fonctions existantes si il y a encore des références à celles-ci. (Ctrl + F: client.xxx)
// Cela nous permettra de tous bosser sur le même code sans avoir à se soucier des conflits de merge.
// Merci d'ajouter des commentaires pour expliquer ce que fait chaque fonction ainsi que le typage des paramètres et du retour.
import { defineStore } from 'pinia'
import { useFetch } from '#app'

export const useRequest: typeof useFetch = (path, options = {}) => {
  const config = useRuntimeConfig()
  options.credentials = 'include'
  options.baseURL = config.public.baseURL
  return useFetch(path, options)
}

interface AppClient {

  // Gardez un seul niveau de hierarchie, ex: group.functionname = implementation
  // group: {
  //    functionname: () => void
  // }

  auth: {
    login: ({
      email,
      password,
    }: {
      email: string
      password: string
    }) => void // login
    signup: ({
      username,
      email,
      password,
    }: {
      username: string
      email: string
      password: string
    }) => void // login
    login42: () => void // login 42
    logout: () => void // logout
    session: () => void // get user data
    update: () => void // update user data
  }
  friends: {
    profile: () => void // get user profile
    list: () => void // get friends list
    add: () => void // add friend
    remove: () => void // remove friend
  }
  chat: {
    // Channels
    create: () => void // create channel
    update: () => void // update channel
    setAdmin: (userId: string, status: boolean) => void // set moderator
    // Admin
    kick: (userId: string) => void // kick user
    ban: (userId: string) => void // ban user
    mute: (userId: string) => void // mute user

    // User
    list: () => void // get channels list
    join: () => void // join channel
    leave: () => void // leave channel
    send: () => void // send message to channel
    sendTo: () => void // send DM to user
    block: () => void // block user
    inviteGame: () => void // invite user to game
  }
  game: {
    create: () => void // create game
  }
}

export const useClient = defineStore('client', () => {
  const client: AppClient = {} as AppClient
  const authStore = useAuth()

  /* ¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯*\
¯-_-¯\_(ツ)_/¯-_-¯ AUTH
\*¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯ */

  // Authentification
  client.auth = {} as AppClient['auth']

  // This function is called to log the user in.
  // It takes an email and a password as parameters
  // and returns a token if the login is successful.
  // Token will also be stored in the cookies, so nothing else is needed after this to keep the session alive.
  // It returns an error if the login is not successful.
  // Finally, we call the auth.refreshSession() function to refresh the session. (see auth.ts)
  client.auth.login = async ({
    email,
    password,
  }) => {
    console.log('login', email, password)
    // data.value.access_token, but not needed here, we use cookies.
    const { data, error } = await useRequest('/auth/login', {
      method: 'POST',
      body: {
        email,
        password,
      },
    })

    if (error.value?.statusCode) {
      authStore.error = error.value?.statusMessage as string
      return
    }
    authStore.showForm = false
    await authStore.refreshSession()
  }

  // This function is called to register a new user
  // It takes an email and a password as parameters
  // It automatically logs the user in after registration.
  client.auth.signup = async ({
    username,
    email,
    password,
  }) => {
    // data.value.access_token, but not needed here, we use cookies.
    const { data, error } = await useRequest('/auth/signup', {
      method: 'POST',
      body: {
        username,
        email,
        password,
      },
    })

    if (error.value?.statusCode) {
      authStore.error = error.value?.statusMessage as string
      return
    }
    // Auto login after registration
    await client.auth.login({
      email,
      password,
    })
  }
  client.auth.logout = async () => {
    const { data, error } = await useRequest('/auth/logout', {
      method: 'POST',
    })
  }
  client.auth.session = async () => {
    // using $fetch here because nuxt SSR fucks up with cookies
    const data = await $fetch(`${useRuntimeConfig().public.baseURL}/auth/session`, {
      method: 'GET',
      credentials: 'include',
    }).catch((x) => {
      return null
    })
    return data
  }

  return client
})
