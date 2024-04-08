import { app, BrowserWindow, ipcMain, globalShortcut, shell } from 'electron'
import path from 'node:path'
import { type Page, type Browser } from 'puppeteer'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import { tmiUrl } from '../src/lib/twitch.js'
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";


type Task = {
  msg: string,
  chatPage: string,
  interval: number,
  headless: boolean,
  page: Page
}

type MyPuppeteerOptions = {
  headless: boolean,
  browserDataDir: string,
  chatPage: string
}


const queue: queueAsPromised<Task> = fastq.promise(asyncWorker, 1)

async function asyncWorker (arg: Task): Promise<void> {
  const { page, msg, chatPage, interval, headless } = arg;
  console.log(`asyncWorker with msg=${msg} chatPage=${chatPage} interval=${interval} headless=${headless}`)
  await youtubeChatPage(page, chatPage)
  await youtubeLogin(page)
  await youtubeChatPage(page, chatPage)
  await youtubeInputBox(page)
  await youtubeTypeAndSend(page, msg)
}

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']




const browserPageSingleton = (function () {
  let instance: { page: Page, browser: Browser } | null;

  async function createInstance(opts: MyPuppeteerOptions) {
    const headless = opts?.headless
    const browserDataDir = path.join(app.getPath('appData'), 'chubBrowserData')


    puppeteer.use(StealthPlugin())
    puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

    // const headless = false
    // const browserDataDir = '/home/chris/.local/share/chub/browserData'
    // const livePage = 'https://www.youtube.com/live_chat?is_popout=1&v=0V0SKiiFZMs'

    const browser = await puppeteer.launch({
      headless,
      args: [
        `--user-data-dir=${browserDataDir}`
      ]
    })
    const [page] = await browser.pages();

    return { browser, page }
  }

  return {
    getInstance: async function (opts: MyPuppeteerOptions) {
      if (!instance) {
        console.log('there is not an instance so we are creating one')
        instance = await createInstance(opts);
      }
      return instance;
    },
    closeInstance: async () => {
      console.log('we have been asked to close the instance. instance as follows')
      console.log(instance)
      if (instance) {
        console.log('there is an instance so we are closing it')
          await instance.browser.close();
          instance = null;
      }
    }
  };
})();

async function youtubeChatPage(page: Page, chatPage: string) {
  console.log(`youtubeChatPage-- idempotently going to ${chatPage}`)
  const url = await page.evaluate(() => document.location.href);
  console.log(`url=${url}`)
  if (url === chatPage) {
    console.log('we are already on the chatpage, so we are doing nothing.')
    return;
  }
  await page.goto(chatPage)
}



async function youtubeLogin(page: Page) {
  console.log('idempotent login')
  try {
    await page.waitForSelector("xpath///a[normalize-space(.)='Sign in to chat']", { timeout: 3000 })
    console.log('the sign into chat button is present. please login.')
    win?.webContents.send('userprompt:youtube:signin');
  } catch (e) {
    console.log('looks like we are already logged in')
  }
  
  return
}
async function youtubeInputBox(page: Page) {
  win?.webContents.send('userprompt:youtube:detecting');
  console.log('clicking the chat input box')
  const chatInputDiv = await page.waitForSelector('div#input');
  if (!chatInputDiv) throw new Error('could not find chat input box');
  await chatInputDiv.click()

  console.log('typing some text to verify we are in the right place')
  await page.keyboard.type(' ', { delay: 101 })

  console.log('looking for #avatar which shows up when text is in the input')
  const avatarElement = await page.waitForSelector('#avatar')
  if (!avatarElement) throw new Error('could not find chat input box avatar');
  const isAvatarVisible = await avatarElement.isVisible()

  if (!isAvatarVisible) throw new Error("CHUB found the chat input box but it wasn't behaving as expected.");

  console.log('clearing chat input box to prepare for future orders')
  await page.keyboard.down('ControlLeft')
  await page.keyboard.press('a')
  await page.keyboard.up('ControlLeft')
  await page.keyboard.press('Backspace')

  console.log('youtube is ready!')
  win?.webContents.send('userprompt:youtube:ready')
}

async function youtubeTypeAndSend(page: Page, msg: string) {
  // console.log('youtubeTypeAndSend DRY RUN @todo remove comments so it actually runs the code')
  console.log(`typing ${msg}`)
  await page.keyboard.type(msg, { delay: 98 })
  console.log(`pressing Enter`)
  await page.keyboard.press('Enter')
}


function createHotkeys() {
  globalShortcut.register('Shift+CommandOrControl+F1', () => {
    console.log('[shortcut] GLOBAL SHORTCUT F1 ACTIVATED!')
    win?.webContents.send('hotkey:repeater:start');
  })
  globalShortcut.register('Shift+CommandOrControl+F2', () => {
    win?.webContents.send('hotkey:repeater:stop');
    console.log('[shortcut] GLOBAL SHORTCUT F2 ACTIVATED!')
  })
}

function createHandlers() {
  console.log('createHandlers()')
  ipcMain.handle('ping', () => Promise.resolve('pong!'))
  ipcMain.handle('twitch:token:url', async () => shell.openExternal(tmiUrl))
  ipcMain.handle('youtube:disconnect', async () => {
    console.log('youtube:disconnect')
    await browserPageSingleton.closeInstance()
    console.log('browser is considered closed')
  })
  ipcMain.handle('youtube:connect', async (_, opts: MyPuppeteerOptions) => {
    console.log('youtube:connect')
    const instance = await browserPageSingleton.getInstance(opts)
    const { page } = instance;
    await youtubeChatPage(page, opts.chatPage)
    await youtubeLogin(page)
    await youtubeInputBox(page)
  })
  ipcMain.handle('youtube:message:send', async (_, opts) => {
    const { msg, chatPage, interval, headless } = opts;
    console.log(`youtube:message:send received with msg=${msg}, chatPage=${chatPage}, interval=${interval}`)
    const { page } = await browserPageSingleton.getInstance(opts)
    queue.push({
      page,
      chatPage,
      interval,
      headless,
      msg
    })
  })

  console.log('done creating handlers')
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', `we have finished loading! ${(new Date).toLocaleString()}`)

  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady()
  .then(createHandlers)
  .then(createHotkeys)
  .then(createWindow)


