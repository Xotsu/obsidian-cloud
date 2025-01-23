import ObsidianCloud from "../main"
import {App, PluginSettingTab, Setting} from "obsidian"
import { doAuth } from "./auth"

export class ObsidianCloudSettingTab extends PluginSettingTab {
  plugin: ObsidianCloud
  
  constructor(app: App, plugin: ObsidianCloud) {
    super(app, plugin)
    this.plugin = plugin
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
    .setName("Dropbox Authentication Token")
    .setDesc("Token used for Dropbox authentication")
    .addButton((button) => 
               button
               .setButtonText("Authenticate")
               .onClick(async () =>{
                 console.log("Test Authenticate Button")
                 await doAuth()
               }))
  }
}
