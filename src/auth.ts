import { Dropbox, DropboxAuth } from "dropbox"
import ObsidianCloud from "../main"

const DROPBOX_APP_KEY = "rajdr32ks88mzxr"

type AccessTokenStore = {
    access_token: string
    refresh_token: string
}

export default class DropboxAuthService{
  private dropboxAuth?: DropboxAuth;
  private accessTokenStore?: AccessTokenStore;
  private dropbox?: Dropbox;
  private redirectUri: string;
  private authUrl?: string;
  private dropboxCodeVerifier: string;
  private writeTokenStoreToPath: (dropboxTokenStore: AccessTokenStore) => Promise<void>;

  constructor(accessTokenStore: AccessTokenStore | undefined, redirectUri: string, writeTokenStoreToPath: (dropboxTokenStore: AccessTokenStore) => Promise<void>){
    this.accessTokenStore = accessTokenStore;
    this.redirectUri = redirectUri;
    this.writeTokenStoreToPath = writeTokenStoreToPath
    this.dropboxCodeVerifier = ""
  }

  public getDropbox(): Dropbox | undefined {
    return this.dropbox
  }

  public async attemptAuth() {
    try {
      if (this.accessTokenStore){
        console.log("ObsidianCloud: Attempting stored auth")
        await this.doStoredAuth();
      } else {
        console.log("ObsidianCloud: Attempting auth setup")
        await this.setupAuth();
      }
      
    } catch (error) {
      console.error("ObsidianCloud: Auth error: ", error);
    }
    console.log("ObsidianCloud: Auth complete")
  }

  private async doStoredAuth() {
    if(!this.dropboxAuth){
      this.dropboxAuth = new DropboxAuth({
        clientId: DROPBOX_APP_KEY,
        accessToken: this.accessTokenStore?.access_token,
        refreshToken: this.accessTokenStore?.refresh_token,
      });
    }

    await this.dropboxAuth.checkAndRefreshAccessToken();

    this.dropbox = new Dropbox({
      auth: this.dropboxAuth,
    })

    // TODO Add data sync here
  }

  private async setupAuth() {
    this.dropboxAuth = new DropboxAuth({
      clientId: DROPBOX_APP_KEY,
    })

    // this.authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token`
    this.authUrl = String(
      await this.dropboxAuth.getAuthenticationUrl(
        this.redirectUri,
        undefined,
        "code",
        "offline",
        undefined,
        undefined,
        true
      )
    )

    this.dropboxCodeVerifier = this.dropboxAuth.getCodeVerifier();

    window.location.assign(this.authUrl)

  }

  public async doAuth(params: any) {

    this.dropboxAuth?.setCodeVerifier(this.dropboxCodeVerifier)

    const accessTokenResponse = await this.dropboxAuth?.getAccessTokenFromCode(
      this.redirectUri,
      params.code
    )
    
    const accessTokenResponseResult = accessTokenResponse?.result as AccessTokenStore

    await this.writeTokenStoreToPath(accessTokenResponseResult)

    this.dropboxAuth?.setAccessToken(accessTokenResponseResult?.access_token)

    this.dropbox = new Dropbox({
      auth: this.dropboxAuth
    })

    // TODO Add data sync here
  }

  //public handleRedirectForToken(): string | null {
  //
  //  const hash = window.location.hash
  //  const params = new URLSearchParams(hash.slice(1))
  //  const accessToken = params.get("access_token")
  //
  //  if(accessToken){
  //    localStorage.setItem("dropboxAccessToken", accessToken)
  //    return accessToken
  //  } else {
  //    console.error("Failed to retrieve access token from URL hash")
  //    return null
  //  }
  //}
}
