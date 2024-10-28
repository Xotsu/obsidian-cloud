import { Plugin } from "obsidian"
import { ObsidianCloudSettingTab } from "./src/settings"


interface ObsidianCloudSettings {
  encryptionPassword: string
  dropboxAccessToken: string
}

const DEFAULT_SETTINGS: ObsidianCloudSettings = {
  encryptionPassword: "",
  dropboxAccessToken: ""
}

export default class ObsidianCloud extends Plugin{
  // Initialising with default settings because TS screams at me, didn't want to definite assignment with !
  settings: ObsidianCloudSettings = DEFAULT_SETTINGS

  async onload(){
    console.log("Initial Load")

    await this.loadSettings()

    this.addSettingTab(new ObsidianCloudSettingTab(this.app, this))

    if (!this.settings.dropboxAccessToken){
      // Implement Dropbox auth
    }
  }

  async onunload(){
    console.log("Final Unload")
  }
  
  // Creates persistent settings for encryption password & dropbox access token
  // https://docs.obsidian.md/Plugins/User+interface/Settings
  async loadSettings(){
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(){
    await this.saveData(this.settings)
  }
}
