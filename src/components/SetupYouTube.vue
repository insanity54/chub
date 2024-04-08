<script setup>
import { computed } from 'vue'
import { useConfigStore } from '../stores/config'

async function startChrome() {
  const response = await window.ipcRenderer.invoke('youtube:connect', { headless: headless.value, chatPage: chatpage.value })
}
// const emit = defineEmits(['startChrome'])
const config = useConfigStore()

const chatpage = computed({
  get() { return config.youtube.chatpage },
  set(val) { config.youtube.chatpage = val }
})
const headless = computed({
  get() { return config.chrome.headless },
  set(val) { config.chrome.headless = val }
})

async function openTmi() {
//   await open(tmiUrl)
}
</script>

<template>

  
  
  <form @submit.prevent="startChrome">
    
    <h2>YouTube Account Setup</h2>
    <p>CHUB controls it's own web browser where it opens youtube and interacts with chat.</p>
    <p>In browser, you will need to log in using your Google account.</p>
    <p>After CHUB's browser is authenticated with Google, you can optionally run in headless mode.</p>


      <fieldset>
        
        <div class="row">
          <div class="col">
            <label for="chatpage">Popout Chatpage <span data-tooltip="Paste a link to the chat you want CHUB to type in. This must be a popout chat page. (a regular video page won't work) Example: https://www.youtube.com/live_chat?is_popout=1&v=0V0SKiiFZMs">?</span></label>
            <input id="chatpage" type="text" placeholder="https://www.youtube.com/live_chat?is_popout=1&v=0V0SKiiFZMs" v-model="chatpage">
          </div>
        </div>
        

        <div class="row">
            <div class="col">
              <input id="headless" type="checkbox" v-model="headless">
              <label for="headless">Headless Mode <span data-tooltip="When Headless Mode is enabled, CHUB's browser will be invisible. Only check this box after you have logged into your youtube account.">?</span></label>
            </div>
        </div>
      </fieldset>

        <button :disabled="!chatpage" type="submit">Start Web Browser</button>

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