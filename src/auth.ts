import { Dropbox, DropboxAuth } from "dropbox"
import ObsidianCloud from "../main"

const DROPBOX_APP_KEY = "rajdr32ks88mzxr"

type AccessTokenStore = {
    access_token: string
    refresh_token: string
}

export class DropboxAuthService{
  private dropboxAuth: DropboxAuth;
  private accessTokenStore: AccessTokenStore | null;
  private dropbox: Dropbox;
  private redirectUri: string;
  private authUrl: string;
  private dropboxCodeVerifier: string;
  private writeTokenStoreToPath: Promise<void>;

  constructor(accessTokenStore: AccessTokenStore | null, redirectUri: string, writeTokenStoreToPath: Promise<void>){
    this.accessTokenStore = accessTokenStore;
    this.redirectUri = redirectUri;
    this.writeTokenStoreToPath = writeTokenStoreToPath
  }

  public getDropbox(): Dropbox{
    return this.dropbox
  }

  public async function attemptAuth(){
    try {
      if (this.accessTokenStore){
        console.log("ObsidianCloud: Attempting stored auth")
        await this.doStoredAuth(accessTokenStore);
      } else {
        console.log("ObsidianCloud: Attempting auth setup")
        await this.setupAuth();
      }
      
    } catch (error) {
      console.error("ObsidianCloud: Auth error: ", error);
    }
    console.log("ObsidianCloud: Auth complete")
  }

  private async function doStoredAuth(): Promise<void> {
    if(!this.dropboxAuth){
      this.dropboxAuth = new DropboxAuth({
        clientId: DROPBOX_APP_KEY,
        accessToken: this.tokenStore.access_token,
        refreshToken: this.tokenStore.refresh_token,
      });
    }

    await this.dropboxAuth.checkAndRefreshAccessToken();

    this.dropbox = new Dropbox({
      auth: this.dropboxAuth,
    })

    // TODO Add data sync here
  }

  private async function setupAuth(): Promise<void> {
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

  public async function doAuth(params: any): Promise<void> {

    this.dropboxAuth.setCodeVerifier(this.dropboxCodeVerifier)

    const accessTokenResponse = await this.dropboxAuth.getAccessTokenFromCode(
      this.redirectUri,
      params.code
    )
    
    const accessTokenResponseResult = accessTokenResponse?.result as AccessTokenStore

    await this.writeTokenStoreToPath(accessTokenResponseResult)

    this.dropboxAuth.setAccessToken(accessTokenResponseResult?.access_token)

    this.dropbox = new Dropbox({
      auth: dropboxAuth
    })

    // TODO Add data sync here
  }

  //public function handleRedirectForToken(): string | null {
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
