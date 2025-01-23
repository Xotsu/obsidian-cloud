// Navigating an obstacle course to get to the dropbox pkce auth docs:
// https://github.com/dropbox/dropbox-sdk-js/blob/main/examples/javascript/pkce-browser/index.html

import { Dropbox, DropboxAuth } from "dropbox"

// clientId (app key) taken from Dropbox docs, IT IS PUBLIC
const DROPBOX_APP_KEY = "42zjexze6mfpf7x"

const dropboxAuth = new DropboxAuth({
  clientId: DROPBOX_APP_KEY
})

export async function doAuth(){
  const redirectUri = "obsidian://open?plugin=obsidian-cloud" //Not sure if i need a uri for the specific vault instead
  const authUrl = String(await dropboxAuth.getAuthenticationUrl(
    redirectUri,
    undefined,
    "code",
    "offline",
    undefined,
    undefined,
    true
  ))
  // Traverse the docs for what this does before i break the obsidian session...
  // window.sessionStorage.clear()
  // Deprecated param still in the docs??
  // window.sessionStorage.setItem("codeVerifier", dropboxAuth.codeVerifier)
  window.location.href = authUrl
}

// This function is named getCodeFromUrl in the docs but returns the auth token so renamed
export function getAccessTokenFromUrl(): string | null {
  const search = window.location.search
  
  // TESTING
  console.log(1111, search)
  
  const accessToken = utils.parseQueryString(search).code
  
  console.log(2222, accessToken)

  if(accessToken){
    localStorage.setItem("dropboxAccessToken", accessToken)
    return accessToken
  } else {
    console.error("Failed to retrieve access token from URL hash")
    return null
  }
}

function hasRedirectedFromAuth(){
  return !!getAccessTokenFromUrl()
}

export function getDropboxInstance(accessToken:string){
  return new Dropbox({accessToken})
}
