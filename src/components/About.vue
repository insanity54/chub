<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification'
import { getRandomInt } from '../lib/util.js'
const $toast = useToast()

const counter = ref(0)
const eggs = [
    'Ouch! 💢',
    "🚫 Pardon me, did you not read the button? 🚫",
    "📕 I'm sorry you can't read! 📕",
    '😠 How dare you! 😠',
    "⚠️ I'm warning you! 🪄",
    '🔥 50 peasants have perished in a fire. Are you happy with yourself? 🔥',
    'I knew you would click it. 😈',
]

const chub = window.ipcRenderer.versions.chub()
const node = window.ipcRenderer.versions.node()
const chrome = window.ipcRenderer.versions.chrome()
const electron = window.ipcRenderer.versions.electron()
const test = async () => {
    const egg = eggs[Math.min(eggs.length-1, counter.value ++)]
    $toast.warning(egg)
    await window.ipcRenderer.invoke('ping')
}
</script>

<template>
    <h1>About</h1>
    
    <figure>
        <img src="/gremlin2.png" width="250px" height="250px">
    </figure>
    
    <h2>Chat Helper User Bot (CHUB)</h2>
    <p>CHUB is a chatty gremlin that can type on your behalf. Be sure to never feed him after midnight!</p>

    <br>
    <div class="card">
        <p>CHUB version {{ chub }}</p>
        <p>Node.js version {{ node }}</p>
        <p>Chrome version {{ chrome }}</p>
        <p>Electron version {{ electron }}</p>
    </div>

    <button @click="test">DO NOT CLICK</button>

</template>