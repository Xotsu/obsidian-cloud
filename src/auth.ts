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

  constructor(accessTokenStore: AccessTokenStore | null){
    this.accessTokenStore = accessTokenStore;
  }

  public async function attemptAuth(){
    try {
      if (this.accessTokenStore){
        console.log("ObsidianCloud: Attempting stored auth")
        await doStoredAuth(accessTokenStore);
      } else {
        console.log("ObsidianCloud: Attempting auth setup")
        await setupAuth();
      }
      
    } catch (error) {
      console.error("ObsidianCloud: Auth error: ", error);
    }
    console.log("ObsidianCloud: Auth complete")
  }

  public async function doStoredAuth(): Promise<void> {
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

  }

  public async function authenticateLocally(dropboxAuth: DropboxAuth){
    dropboxAuth.access_token = "" 
    dropboxAuth.refresh_token = ""

    await dropboxAuth.checkAndRefreshAccessToken()

    return new Dropbox({
      auth: dropboxAuth
    })
  }

  public async function authenticateWithDropbox(dropboxAuth: DropboxAuth, redirectUri: string) : string {

    // const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${DROPBOX_APP_KEY}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token`
    
    const authUrl = String(
      await dropboxAuth.getAuthenticationUrl(
        redirectUri,
        undefined,
        "code",
        "offline",
        undefined,
        undefined,
        true
      )
    )

    window.location.assign(authUrl)
  }

  public async function doAuth(dropboxAuth: DropboxAuth, redirectUri: string, params: any){

    dropboxAuth.setCodeVerifier(dropboxAuth.getCodeVerifier())

    const accessTokenResponse = await dropboxAuth.getAccessTokenFromCode(
      redirectUri,
      params.code
    )
    
    const accessTokenResponseResult = accessTokenResponse?.result as AccessTokenStore

    await this.app.vault.adapter.write(
      this.dropboxTokenStorePath
      JSON.stringify(accessTokenResponseResult)
    )

    dropboxAuth.setAccessToken(accessTokenResponseResult?.access_token)

    return new Dropbox({
      auth: dropboxAuth
    })

  }


  public function handleRedirectForToken(): string | null {

    const hash = window.location.hash
    const params = new URLSearchParams(hash.slice(1))
    const accessToken = params.get("access_token")
    
    if(accessToken){
      localStorage.setItem("dropboxAccessToken", accessToken)
      return accessToken
    } else {
      console.error("Failed to retrieve access token from URL hash")
      return null
    }

  }

  public function getDropboxAuthInstance(){

    return new DropboxAuth({ client_id: DROPBOX_APP_KEY})

  }
}
