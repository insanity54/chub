<script setup>
import SetupTwitch from './SetupTwitch.vue'
import TwitchRepeater from './TwitchRepeater.vue'
import { useConfigStore } from '../stores/config'
import { useToast } from 'vue-toast-notification'
import { mutateString } from '../lib/mutateString'
import PQueue from 'p-queue'
import delay from 'delay'


const config = useConfigStore()
const $toast = useToast();
const queue = new PQueue({concurrency: 1});


let twitchClient
let counter = 0
let timer
let cancelRepetition

async function join(channel) {
  if (!twitchClient) connect();
  twitchClient.join(channel)
    .then((data) => {
        console.log(`joined channel`)
        console.log(data)
        $toast.success(`joined channel`)
    }).catch((err) => {
        $toast.error(err, { duration: 0 })
    });
}


async function sendMessage(count, variety = 0, dry = false) {
  const msg = (variety > 0) ? mutateString(config.youtube.message, variety) : config.youtube.message;
  $toast.info(`Sending message ${count}: "${msg}" to #${config.youtube.channel}.`);
  if (!twitchClient) {
    await connect()
  }
  if (!dry) {
    twitchClient.say(config.youtube.channel, msg)
  }
}


async function repeatStart() {
  if (!config?.twitch?.repeater?.limit || typeof config.youtube.limit !== 'number') {
    $toast.error(`limit number is missing!`)
    return
  }
  if (!config?.twitch.repeater?.interval || typeof config.youtube.interval !== 'number') {
    $toast.error(`interval number is missing!`)
    return
  }
  if (!config?.twitch.repeater?.channel) {
    $toast.error(`channel is missing!`)
    return
  }
  if (!config?.twitch.repeater?.message) {
    $toast.error(`message is missing!`)
    return
  }
    
  for (let i = 0; i < config.youtube.limit; i++) {
    queue.add(() => sendMessage(i, config.youtube.variety, config.youtube.dry))
    queue.add(() => delay(config.youtube.interval))
  }

}

function repeatStop() {
  queue.clear()
  $toast.success('Repeater stopped.')
}

async function connect() {
  twitchClient = new tmi.Client({
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
  
  twitchClient.on("connected", (address, port) => {
    $toast.success(`Twitch client connected!`)
    config.$patch({ twitch: { connected: new Date().toISOString() }})
  });

  twitchClient.on("notice", (channel, userstate, message, self) => {
    $toast.info(`[NOTICE] ${channel} ${message}`, { duration: 30000 })
  });

  twitchClient.on("disconnected", (reason) => {
    config.$patch({ twitch: { connected: false }})
    $toast.error(`Disconnected from Twitch! ${reason}`)
  });

  twitchClient.on("ban", (channel, username, reason, userstate) => {
    console.error(`banned! channel=${channel} username=${username} reason=${reason} userstate=${userstate}`)
    $toast.error(`${username} has been banned from ${channel}`, { duration: 0 })
  });
  
  await twitchClient.connect()
}

</script>


<template>

  <a href="#" @click="config.page = 'youtube'">Setup</a> /
  <a href="#" @click="config.page = 'repeater'">Repeater</a>

  <h1>YouTube Bot</h1>

  <SetupTwitch v-if="config.page==='twitch'"></SetupTwitch>
  <TwitchRepeater v-if="config.page==='repeater'" @repeatStart="repeatStart" @repeatStop="repeatStop"></TwitchRepeater>
</template>
