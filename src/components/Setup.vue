<script setup>

import SetupTwitch from './SetupTwitch.vue'
import SetupYouTube from './SetupYouTube.vue'
import { useConfigStore } from '../stores/config'


const config = useConfigStore()

async function startChrome(arg0, arg1) {
  console.log(`startChrome with arg0=${arg0} arg1=${arg1}`)
  await emit('startChrome', { arg0, arg1 });
}
</script>


<template>

    <h1>Setup</h1>
    <a href="#" @click="config.page = 'setupTwitch'">Twitch</a> /
    <a href="#" @click="config.page = 'setupYoutube'">YouTube</a> /
    <a href="#" @click="config.page = 'setupHotkeys'">Hotkeys</a>
  
    <SetupTwitch v-if="config.page==='setupTwitch'" @connect="connect"></SetupTwitch>
    <SetupYouTube v-if="config.page==='setupYoutube'" @startChrome="startChrome"></SetupYouTube>
    <SetupHotkeys v-if="config.page==='setupHotkeys'"></SetupHotkeys>
  </template>
  

<style></style>