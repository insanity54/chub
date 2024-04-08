<script setup>
import Setup from './components/Setup.vue'
import SetupTwitch from './components/SetupTwitch.vue'
import SetupYouTube from './components/SetupYouTube.vue'
import Tools from './components/Tools.vue'
import About from './components/About.vue'
import Nav from './components/Nav.vue'
import Repeater from './components/Repeater.vue'
import SetupHotkeys from './components/SetupHotkeys.vue'
import { useConfigStore } from './stores/config.js'
import { useToast } from 'vue-toast-notification'
import { mutateString } from './lib/mutateString'
import { useTwitch } from './lib/twitch.js'
import PQueue from 'p-queue'
import delay from 'delay'

const $toast = useToast()
const twitch = useTwitch()

const queue = new PQueue({ concurrency: 1 });


window.ipcRenderer.on('userprompt:youtube:signin', () => {
  $toast.warning("Please sign in to your youtube account using CHUB's Chrome browser", { duration: 0 })
})
window.ipcRenderer.on('userprompt:youtube:ready', () => {
  $toast.success("Youtube is ready", { duration: 10000 })
})
window.ipcRenderer.on('hotkey:repeater:start', () => {
  $toast.success("[Hotkey] Starting Message Repeater")
  repeatStart()
})
window.ipcRenderer.on('hotkey:repeater:stop', () => {
  $toast.success("[Hotkey] Stopping Message Repeater")
  repeatStop()
})



async function sendMessage(index, variety = 0) {
  // choose a message based on canned message mode

  const configuredMessage = (() => {
    console.log(`canned index=${index} method=${config.repeater.canned.method} messages.length=${config.repeater.canned.messages.length}`)
    if (config.repeater.canned.method === 'sequential') return config.getRepeaterCannedNextMessage(index)
    else return config.getRepeaterCannedRandomMessage()
  })()
  if (!configuredMessage) {
    $toast.error('Cannot send empty message')
    return
  }

  const msg = (variety > 0) ? mutateString(configuredMessage, variety) : configuredMessage;
  if (config.repeater.platform === 'dry') {
    $toast.info(`Test message ${index}: "${msg}"`);
  }
  else if (config.repeater.platform === 'twitch') {
    const consoleMessage = `Sending message ${index}: "${msg}" to #${config.twitch.channel}`
    $toast.info(consoleMessage);
    console.info(consoleMessage)
    twitch.send(config.twitch.channel, msg)
  }
  else if (config.repeater.platform === 'youtube') {
    $toast.info(`Sending message ${index}: "${msg}" to YouTube`)
    window.ipcRenderer.invoke('youtube:message:send', {
      msg,
      chatPage: config.youtube.chatpage,
      interval: config.repeater.interval,
      headless: config.chrome.headless
    })
  }
}


async function repeatStart() {
  // console.log(JSON.stringify(config, null, 2))

  if (!config?.repeater?.limit) {
    $toast.error(`limit number is missing!`)
    return
  }
  if (typeof config.repeater.limit !== 'number') {
    $toast.error(`limit is not a number!`)
    return
  }
  if (!config?.repeater?.interval) {
    $toast.error(`interval number is missing!`)
    return
  }
  if (typeof config?.repeater?.interval !== 'number') {
    $toast.error(`interval is not a number!`)
  }

  for (let i = 0; i < config.repeater.limit; i++) {
    queue.add(() => sendMessage(i, config.repeater.variety))
    queue.add(() => delay(config.repeater.interval))
  }

}

function repeatStop() {
  queue.clear()
  $toast.success('Repeater stopped.')
}

async function twitchConnect() {
  twitch.connect()
}
async function twitchDisconnect() {
  twitch.disconnect()
}


const config = useConfigStore()

</script>

<template>

  <Nav></Nav>

  <Setup v-if="config.page === 'setup'"></Setup>
  <SetupYouTube v-if="config.page === 'setupYoutube'"></SetupYouTube>
  <SetupTwitch v-if="config.page === 'setupTwitch'" @twitchConnect="twitchConnect"></SetupTwitch>
  <SetupHotkeys v-if="config.page === 'setupHotkeys'"></SetupHotkeys>
  <Repeater v-if="config.page === 'repeater'" @repeatStart="repeatStart" @repeatStop="repeatStop"
    @sendMessage="sendMessage" @twitchConnect="twitchConnect" @twitchDisconnect="twitchDisconnect"></Repeater>
  <Tools v-if="config.page === 'tools'"></Tools>
  <About v-if="config.page === 'about'"></About>

</template>
