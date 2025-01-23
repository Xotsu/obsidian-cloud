import { Dropbox, DropboxAuth } from "dropbox"
import ObsidianCloud from "../main"

const DROPBOX_APP_KEY = "rajdr32ks88mzxr"

type accessTokenStore = {
    access_token: string
    refresh_token: string
}

export async function authenticateLocally(dropboxAuth: DropboxAuth){
  dropboxAuth.access_token = 
  dropboxAuth.refresh_token = 

  await dropboxAuth.checkAndRefreshAccessToken()

  return new Dropbox({
    auth: dropboxAuth
  })
}

export async function authenticateWithDropbox(dropboxAuth: DropboxAuth, redirectUri: string) : string {

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

export async function doAuth(dropboxAuth: DropboxAuth, redirectUri: string, params: any){

  dropboxAuth.setCodeVerifier(dropboxAuth.getCodeVerifier())

  const accessTokenResponse = await dropboxAuth.getAccessTokenFromCode(
    redirectUri,
    params.code
  )
  
  const accessTokenResponseResult = accessTokenResponse?.result as accessTokenStore

  await this.app.vault.adapter.write(
    this.dropboxTokenStorePath
    JSON.stringify(accessTokenResponseResult)
  )

  dropboxAuth.setAccessToken(accessTokenResponseResult?.access_token)

  return new Dropbox({
    auth: dropboxAuth
  })

}


export function handleRedirectForToken(): string | null {

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

export function getDropboxAuthInstance(){

  return new DropboxAuth({ client_id: DROPBOX_APP_KEY})

}
