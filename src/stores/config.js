import { defineStore } from 'pinia'
import { getRandomInt } from '../lib/util.js'

export const useConfigStore = defineStore('config', {
    persist: true,
    state: () => {
        return {
            count: 0,
            page: 'setup',
            repeater: {
                platform: 'dry',
                interval: 1000,
                limit: 3,
                variety: 0,
                canned: {
                    counter: 0,
                    method: 'sequential', // sequential|random
                    messages: [
                        'POGGERS POGGERS POGGERS POGGERS POGGERS',
                        'lorem ipsum',
                        'abcdefghijklmnopqrstuvwxyz',
                        'jajajajajajajajajajaja'
                    ]
                }
            },
            twitch: {
                token: '',
                username: '',
                channel: 'xqc',
                connected: false,
            },
            youtube: {
                chatpage: 'https://www.youtube.com/live_chat?is_popout=1&v=0V0SKiiFZMs'
            },
            chrome: {
                chromepath: 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
                headless: false,
            }
        }
    },
    actions: {
        setConfig(config) {
            this.count = config.count
            this.page = config.page
            this.twitch = config.twitch
            this.youtube = config.youtube
        },
        setTwitchUsername(username) {
            this.twitch.username = username
        },
        setTwitchToken(token) {
            this.twitch.token = token
        },
        setTwitchChannel(channel) {
            this.twitch.channel = channel
        },
        setRepeater(opts) {
            this.repeater.channel = opts.channel
            this.repeater.interval = opts.interval
            this.repeater.limit = opts.limit
            this.repeater.dry = opts.dry
        },
        setRepeaterChannel(channel) {
            this.repeater.channel = channel
        },
        addRepeaterCannedMessage(msg, index=this.repeater.canned.messages.length) {
            this.repeater.canned.messages.splice(index, 0, msg)
        },
        removeRepeaterCannedMessage(i) {
            this.repeater.canned.messages.splice(i, 1)
        },
        getRepeaterCannedNextMessage(index) {
            // Increment the index and loop around if it exceeds the length of the messages array
            const i = index % this.repeater.canned.messages.length;
            return this.repeater.canned.messages[i];
        },
        getRepeaterCannedRandomMessage() {
            const i = getRandomInt(0, this.repeater.canned.messages.length-1)
            console.log(`random i=${i}`)
            return this.repeater.canned.messages[i]
        },
        setRepeaterInterval(interval) {
            this.repeater.interval = interval
        },
        setRepeaterLimit(limit) {
            this.repeater.limit = limit
        },
        setRepeaterVariety(variety) {
            this.repeater.variety = variety
        },
        setRepeaterDry(dry) {
            this.repeater.dry = dry
        },
        setPage(page) {
            console.log(`setting page to ${page}`)
            this.$patch({ 'page': page })
        }
    },
    getters: {
        repeaterCannedMessages(state) {
          return state.repeater.canned.messages
        }
    },
})