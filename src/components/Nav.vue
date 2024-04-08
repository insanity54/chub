<script setup>
import { useConfigStore } from '../stores/config'
import { useToast } from 'vue-toast-notification'

const $toast = useToast();
const config = useConfigStore()

</script>

<template>

    <nav>
        <ul>
            <li>
                <a @click="config.setPage('setup')" href="#">Setup</a>
                <ul>
                    <li>
                        <a @click="config.setPage('setupTwitch')" href="#">Twitch</a>
                    </li>
                    <li>
                        <a @click="config.setPage('setupYoutube')" href="#">YouTube</a>
                    </li>
                    <li>
                        <a @click="config.setPage('setupHotkeys')" href="#">Hotkeys</a>
                    </li>
                </ul>
            </li>
            <li>
                <a @click="config.setPage('tools')" href="#">Tools</a>
                <ul>
                    <li><a @click="config.setPage('repeater')" href="#">Repeater</a></li>
                </ul>
            </li>
            <li><a @click="config.setPage('about')" href="#">About</a></li>
            <button class="float-right" @click="() => { $toast.clear(); $toast.info('notifs cleared', { duration: 250 }) }">Clear Notifs</button>
        </ul>
    </nav>


</template>