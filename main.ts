import { Plugin } from "obsidian"
import { ObsidianCloudSettingTab } from "./src/settings"
import { DropboxAuthService } from "./src/auth"

interface ObsidianCloudSettings {
  encryptionPassword: string
  dropboxAccessToken: string
}

type AccessTokenStore = {
    access_token: string
    refresh_token: string
}

const DEFAULT_SETTINGS: ObsidianCloudSettings = {
  encryptionPassword: "",
  dropboxAccessToken: ""
}

export default class ObsidianCloud extends Plugin{
  // Initialising with default settings because TS screams at me, didn't want to definite assignment with !
  settings: ObsidianCloudSettings = DEFAULT_SETTINGS
  pluginName = "obsidian-cloud"
  redirectUri = `obsidian://${pluginName}`
  dropboxTokenStorePath = `${this.manifest.dir}/.__dropbox_token_store__`
  dropboxTokenStore: AccessTokenStore;
  token: string;
  dropboxAuthService: DropboxAuthService;

  async onload(){
    console.log("Initial Load")

    await this.loadSettings()
    this.addSettingTab(new ObsidianCloudSettingTab(this.app, this))
    
    this.dropboxBackupsTokenStore = JSON.parse(
      await this.app.vault.adapter.read(
        this.dropboxBackupsTokenStorePath
      )
    )

    if(this.dropboxBackupsTokenStore){
      this.dropboxBackupsTokenStore = await this.app.vault.adapter.read(
        this.dropboxBackupsTokenStorePath
      )
    }

    // Handle the Dropbox callback
    this.registerObsidianProtocolHandler(
      this.redirectUri,
      async (params) => this.token = await doAuth(params)
    )
    
    // TODO Add a manual backup button

    this.dropboxAuthService = DropboxAuthService(this.dropboxTokenStore, this.redirectUri)

    this.dropboxAuthService.attemptAuth();

    this.registerInterval(
      window.setInterval(
        async () => {
          try {
            // TODO await attemptSync();
          } catch (ignore){
            this.dropboxAuthService.attemptAuth();
          }
        },
        60000 * 5 // 1 min = 60000
      )
    )


    //const token = handleRedirectForToken()
    
    //// Stores token if redirected from auth
    //if(token){
    //  this.settings.dropboxAccessToken = token
    //  await this.saveSettings()
    //}
    //
    //if (!this.settings.dropboxAccessToken){
    //  await doAuth()
    //} else {
    //  console.log("Authenticated with Dropbox!")
    //  const dropbox = getDropboxInstance(this.settings.dropboxAccessToken)
    //  // Sync with vault - TO BE IMPLEMENTED
    //  // await this.syncVaultToDropbox(dopbox)
    //}
    
 }

  async onunload(){
    console.log("Unload")
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
