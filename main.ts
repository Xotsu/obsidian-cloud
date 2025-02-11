import { Plugin } from "obsidian"
import { ObsidianCloudSettingTab } from "./src/settings"
import DropboxAuthService from "./src/auth"

interface ObsidianCloudSettings {
  encryptionPassword: string
  dropboxAppKey: string
}

type AccessTokenStore = {
    access_token: string
    refresh_token: string
}

const DEFAULT_SETTINGS: ObsidianCloudSettings = {
  encryptionPassword: "",
  dropboxAppKey: ""
}

export default class ObsidianCloud extends Plugin {
  // Initialising with default settings because TS screams at me, didn't want definite assignment with !
  settings: ObsidianCloudSettings = DEFAULT_SETTINGS
  pluginName = "obsidian-cloud"
  redirectUri = `obsidian://${this.pluginName}`
  dropboxTokenStorePath = `${this.manifest.dir}/.__dropbox_token_store__`
  dropboxTokenStore?: AccessTokenStore;
  dropboxAuthService?: DropboxAuthService;

  async writeTokenStoreToPath(dropboxTokenStore: AccessTokenStore): Promise<void> {
    this.dropboxTokenStore = dropboxTokenStore

    await this.app.vault.adapter.write(
      this.dropboxTokenStorePath,
      JSON.stringify(dropboxTokenStore)
    )
  }

  async onload() {
    console.log("Initial Load")
   
    await this.loadSettings()

    if(
      await this.app.vault.adapter.exists(
        this.dropboxTokenStorePath
      ))
    {
      this.dropboxTokenStore = JSON.parse(
        await this.app.vault.adapter.read(
          this.dropboxTokenStorePath
        )
      )
    }

    // TODO Add a manual backup button

    this.dropboxAuthService = new DropboxAuthService(this.dropboxTokenStore, this.redirectUri, this.writeTokenStoreToPath)
    this.addSettingTab(new ObsidianCloudSettingTab(this.app, this, this.dropboxAuthService))

    // Handle the Dropbox callback
    this.registerObsidianProtocolHandler(
      this.redirectUri,
      async (params) => {await this.dropboxAuthService?.doAuth(params)},
    );

    await this.dropboxAuthService.attemptAuth();

    this.registerInterval(
      window.setInterval(
        async () => {
          try {
            // TODO await attemptSync();
          } catch (ignore){
            await this.dropboxAuthService?.attemptAuth();
          }
        },
        60000 * 5 // 1 min = 60000
      )
    )
  }

  async onunload(){
    console.log("Unloading ObsidianCloud")
  }
  
  // Creates persistent settings for encryption password & dropbox app key
  // https://docs.obsidian.md/Plugins/User+interface/Settings
  async loadSettings(){
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings(){
    await this.saveData(this.settings)
  }
}
