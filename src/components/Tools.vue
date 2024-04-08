<script setup>

import Repeater from './Repeater.vue'
import { useConfigStore } from '../stores/config.js'

const config = useConfigStore()

</script>


<template>
    <h1>Tools</h1>
    <a href="#" @click="config.page = 'repeater'">Repeater</a>
    <Repeater v-if="config.page==='repeater'" ></Repeater>
</template>
  

<style></style>