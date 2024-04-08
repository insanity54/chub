<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../stores/config'
import { tmiUrl } from '../lib/twitch.js'

const emit = defineEmits(['connect'])
const config = useConfigStore()
const username = computed({
  get() { return config.twitch.username },
  set(val) { config.twitch.username = val }
})
const token = computed({
  get() { return config.twitch.token },
  set(val) { config.twitch.token = val }
})
const channel = computed({
  get() { return config.twitch.channel },
  set(val) { config.twitch.channel = val }
})


async function openTmi() {
  window.ipcRenderer.invoke('twitch:token:url')
}
</script>

<template>

  <form @submit.prevent="$emit('twitchConnect')">
    
    <h2>Twitch Account Setup</h2>
    <p>Enter your Twitch username and OAuth Password below.</p>
    <p>Get an OAuth Password at <a :href="tmiUrl" @click.prevent="openTmi">{{ tmiUrl }}</a></p>


      <fieldset>
         <div class="row">
          <div class="col">
            <label for="username">Username <span data-tooltip="The username of your Twitch account">?</span></label>
            <input id="username" type="text" placeholder="MyCoolTwitchUsername" v-model="username">
          </div>
          <div class="col">
            <label for="token">Token <span data-tooltip="The auth token for your Twitch account">?</span></label>
            <input id="token" type="text" placeholder="oauth:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" v-model="token">
          </div>
        </div>
        <div class="row">
          <div class="col">
            <label for="channel">Channel <span data-tooltip="CHUB will send messages to this channel">?</span></label>
            <input id="channel" type="text" placeholder="xqc" v-model="channel">
          </div>
        </div>

        <button :disabled="!token" type="submit">Test connection</button>
      </fieldset>
    </form>

<!-- 
    <div class="card warn">
      <p>Error</p>
      <p>This is the error body.</p>
    </div>

    <div class="card hint">
      <p>Success</p>
      <p>Connection verified</p>
    </div> -->

</template>