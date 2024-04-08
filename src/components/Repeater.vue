<script setup>
import { computed, nextTick, watch } from 'vue'
import { useConfigStore } from '../stores/config'
import { useToast } from 'vue-toast-notification'

const $toast = useToast()
const config = useConfigStore()
const emit = defineEmits(['repeat:start', 'repeat:stop', 'twitch:connect', 'twitch:disconnect'])
const channel = computed({
  get() { return config.repeater.channel },
  set(val) { config.repeater.channel = val }
})
// const messages = computed({
//   get() { return config.repeater.canned.messages },
//   set(val) { config.repeater.canned.messages = val }
// })
const limit = computed({
  get() { return config.repeater.limit },
  set(val) { config.repeater.limit = val }
})
const interval = computed({
  get() { return config.repeater.interval },
  set(val) { config.repeater.interval = val }
})
const variety = computed({
  get() { return config.repeater.variety },
  set(val) { config.repeater.variety = val }
})
const platform = computed({
  get() { return config.repeater.platform },
  set(val) { config.repeater.platform = val }
})
const method = computed({
  get() { return config.repeater.canned.method },
  set(val) { config.repeater.canned.method = val }
})
watch(platform, async (newPlatform, oldPlatform) => {
  // prepare, connect the platform API being selected
  if (newPlatform === 'twitch') {
    emit('twitchConnect')
  } else if (newPlatform === 'youtube') {
    window.ipcRenderer.invoke('youtube:connect', { 
      chatPage: config.youtube.chatpage,
      headless: config.chrome.headless
    })
  }

  // disconnect, shutdown the platform API being deselected
  if (oldPlatform === 'twitch') {
    emit('twitchDisconnect')
  } else if (oldPlatform === 'youtube') {
    window.ipcRenderer.invoke('youtube:disconnect')
  }

})


function addMessage(msg, index=0) {
  config.addRepeaterCannedMessage(msg, index)
  const newInputId = `message${index}`;
  console.log(`switching focus to ${newInputId}`)
  nextTick(() => {
    const newInput = document.getElementById(newInputId);
    if (newInput) {
      newInput.focus();
    }
  })
}

function removeMessage(index) {
  config.removeRepeaterCannedMessage(index)
}

function resetForm() {
  channel.value = ''
  limit.value = 3
  config.repeater.canned.messages = []
  interval.value = 2000
  variety.value = 0
  platform.value = 'dry'
}

</script>

<template>

<form>
  <h1>Message Repeater</h1>
    <fieldset>
      <legend>Platform</legend>


      <div class="row">
        <div class="col">
            <input id="radio1" name="radio" type="radio" value="twitch" v-model="platform">
            <label for="radio1">Twitch</label><br>
            <input id="radio2" name="radio" type="radio" value="youtube" v-model="platform">
            <label for="radio2">YouTube</label><br>
            <input id="radio3" name="radio" type="radio" value="dry" v-model="platform">
            <label for="radio3">Nowhere (Dry Run)</label><br>
        </div>
      </div>
      </fieldset>
      <fieldset>
        <legend>Message List</legend>


      <div class="row" v-for="(message, index) in config.repeaterCannedMessages" :key="index">
        <div class="col">
          <!-- <label :for="'message' + index">Message {{ index + 1 }}</label> -->
          
          <input @keydown.enter.prevent @keyup.enter="addMessage('', index+1)" :id="'message' + index" type="text" v-model="config.repeater.canned.messages[index]">
        </div>
        <div class="col-1">
          <button class="nomargin" type="button" @click="removeMessage(index)">Remove</button>
        </div>
      </div>
      <button @click.prevent="addMessage('', config.repeaterCannedMessages.length)">Add Message</button>

    </fieldset>


    <fieldset>
      <legend>Message Selection Method</legend>
      <div class="row">
        <div class="col">
            <input id="method-random" name="method" type="radio" value="random" v-model="method">
            <label for="method-random">Random</label><br>
            <input id="method-sequential" name="method" type="radio" value="sequential" v-model="method">
            <label for="method-sequential">Sequential</label><br>
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Mutations</legend>
      <div class="row">
        <div class="col">
          <label for="variety">Message variety {{ variety }}</label>
          <input type="range" id="variety" v-model="variety" max="10" min="0">
        </div>
      </div>
    </fieldset>


    <fieldset>
      <legend>Timing</legend>
      <div class="row">
        <div class="col">
          <label for="interval">Interval between messages <span data-tooltip="CHUB will wait this many milliseconds after sending each message">?</span></label>
          <input id="interval" type="number" v-model="interval">
        </div>

        <div class="col-5">
          <label for="limit">Message Limit <span data-tooltip="CHUB will stop sending messages after it's sent this many">?</span></label>
          <input id="limit" type="number" v-model="limit">
        </div>
      </div>
    </fieldset>



    <fieldset>
      <legend>Controls</legend>
      <p v-if="platform === 'youtube'">Sending messages to <b>YouTube</b></p>
      <p v-if="platform === 'twitch'">Sending messages to <b>Twitch</b></p>
      <p v-if="platform === 'dry'">Sending messages <b>nowhere</b> (dry run)</p>
      <button @click.prevent="$emit('repeatStart')">Start</button>
      <button @click.prevent="$emit('repeatStop')">Stop</button>
      <button @click.prevent="resetForm">Reset</button>
    </fieldset>
  </form>



</template>


<style scoped>
  .nomargin {
    margin: 0
  }
</style>