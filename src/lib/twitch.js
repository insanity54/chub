// twitch.js
import { ref, onMounted, onUnmounted } from 'vue'
import { useConfigStore } from '../stores/config.js'
import { useToast } from 'vue-toast-notification'
import delay from 'delay'
import tmi from 'tmi.js'


export const tmiUrl = 'https://twitchapps.com/tmi/'

export function useTwitch() {
    const $toast = useToast();

    const connected = ref(false)
    const joined = ref(false)
    const channel = ref('')
    const config = useConfigStore()

    let twitchClient = new tmi.Client({
        options: {
            debug: true,
            skipUpdatingEmotesets: true
        },
        connection: {
            secure: true,
            reconnect: true
        },
        identity: {
            username: config.twitch.username,
            password: config.twitch.token
        }
    });

    twitchClient.on("disconnected", (reason) => {
        console.error('twitch disconnected')
        $toast.error(`twitch disconnected. ${reason}`, { duration: 10000 })
        connected.value = false
    });
    twitchClient.on("connecting", (address, port) => {
        console.log('twitch connecting')
        $toast.info(`twitch is connecting.`)
        connected.value = false
    });
    twitchClient.on("connected", (address, port) => {
        $toast.success('Connected to Twitch!')
        config.$patch({ twitch: { connected: new Date().toISOString() }})
        connected.value = true
    });
    twitchClient.on("notice", (channel, userstate, message, self) => {
        $toast.warning(`Twitch [NOTICE] ${channel} ${message}`)
    });
    twitchClient.on("ban", (channel, username, reason, userstate) => {
        console.error(`banned! channel=${channel} username=${username} reason=${reason} userstate=${userstate}`)
        $toast.error(`${username} has been banned from ${channel}`, { duration: 0 })
    });


    async function connect() {
        twitchClient.connect()
    }

    // function connectOld() {
    //     twitchClient = new tmi.Client({
    //         options: {
    //           debug: true,
    //           skipUpdatingEmotesets: true
    //         },
    //         connection: {
    //             secure: true,
    //             reconnect: true
    //         },
    //         identity: {
    //           username: config.twitch.username,
    //           password: config.twitch.token
    //         }
    //       });

    //       twitchClient.connect()
    // }

    function disconnect() {
        twitchClient.disconnect()
    }

    async function join(channel) {
        if (!connected) connect();
        twitchClient.join(channel)
            .then((data) => {
                console.log(`joined channel`)
                console.log(data)
                $toast.success(`joined channel`)
            }).catch((err) => {
                console.error('there was an error here for some reason')
                console.error(err)
                $toast.error(err)
            });
    }

    async function send(channel, msg) {
        console.log(`we are being asked to send. connected=${connected.value}`)
        // I'm assuming channels length 0 means we aren't connected
        if (!connected.value) {
            $toast.info('Connecting to twitch')
            await connect()
            await delay(1000) // @todo more elegant solution, plz
        }
        if (twitchClient.channels.length === 0) {
            await join(config.twitch.channel);
            await delay(2000)
        }
        console.log(`twitch.js sending channel=${channel} msg=${msg}`)
        twitchClient.say(channel, msg)
    }

    // a composable can also hook into its owner component's
    // lifecycle to setup and teardown side effects.
    onMounted(() => {
        // connect to twitch
        // connect()
    })
    onUnmounted(() => {
        // disconnect from twitch
        // disconnect()
    })

    return {
        connected,
        joined,
        channel,
        connect,
        disconnect,
        join,
        send,
    }
}