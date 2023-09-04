// Le client est un objet qui contient toutes les fonctions de l'app.
// Il peut être utilisé partout dans la partie front pour interagir avec les différents composants.
// Vous pouvez ajouter des fonctions ici pour les rendre accessibles partout dans l'app, mais ne supprimez pas les fonctions existantes si il y a encore des références à celles-ci. (Ctrl + F: client.xxx)
// Cela nous permettra de tous bosser sur le même code sans avoir à se soucier des conflits de merge.
// Merci d'ajouter des commentaires pour expliquer ce que fait chaque fonction ainsi que le typage des paramètres et du retour.

interface AppClient {

  // Gardez un seul niveau de hierarchie, ex: group.functionname = implementation
  // group: {
  //    functionname: () => void
  // }

  auth: {
    login: ({
      username,
      password,
    }: {
      username: string
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
  socket: {
    connect: () => void // connect to socket server
    disconnect: () => void // disconnect from socket server
    on: (
      event: string,
      callback: (data: any) => void
    ) => void // listen to socket event
    emit: (
      event: string,
      data: any
    ) => void // emit socket event
  }
  test: () => Promise<any>
}

const client: AppClient = {} as AppClient

/* ¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯*\
¯-_-¯\_(ツ)_/¯-_-¯ AUTH
\*¯-_-¯-_-¯-_-¯-_-¯-_-¯-_-¯ */

// Authentification
client.auth = {} as AppClient['auth']

client.auth.login = ({
  username,
  password,
}) => {
  console.log('login', username, password)
}
client.auth.logout = () => {
  console.log('logout')
}
client.auth.session = () => {
  console.log('me')
}

client.test = async () => {
  // return await $fetch('http://backend:3000/')
  throw new Error('test')
}
export function useClient() {
  return client
}
