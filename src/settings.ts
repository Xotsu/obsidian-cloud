import ObsidianCloud from "../main"
import DropboxAuthService from "./auth"
import {App, PluginSettingTab, Setting} from "obsidian"

export class ObsidianCloudSettingTab extends PluginSettingTab {
  plugin: ObsidianCloud
  dropboxAuthService: DropboxAuthService
  
  constructor(app: App, plugin: ObsidianCloud, dropboxAuthService: DropboxAuthService) {
    super(app, plugin)
    this.plugin = plugin
    this.dropboxAuthService = dropboxAuthService
  }
  
  display(): void{
    let {containerEl} = this
    containerEl.empty()
    containerEl.createEl("h2", {text: "Dropbox Sync Settings"})

  new Setting(containerEl)
    .setName("Encryption Password")
    .setDesc("Enter a password for encrypting your files in the cloud")
    .addText((text) => 
             text
             .setPlaceholder("Enter your encryption password")
             .setValue(this.plugin.settings.encryptionPassword)
             .onChange(async (value) => {
               this.plugin.settings.encryptionPassword = value
               await this.plugin.saveSettings()
             })
            )
  
  new Setting(containerEl)
    .setName("Dropbox App Key")
    .setDesc("Key used for identifying Dropbox App")
    .addButton((button) => 
               button
               .setButtonText("Authenticate")
               .onClick(async () =>{
                 console.log("Test Authenticate Button")
                 await this.dropboxAuthService.attemptAuth()
               }))
  }
}
