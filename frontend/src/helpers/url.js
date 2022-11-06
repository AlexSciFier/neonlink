export function getDomain(url) {
  return new URL(url).host;
}
/**
   * Change port to 3333 if app run in development env, and url start with ``/``
   * @param {string} url 
   * @returns {string} modified url
   */
export const fixBgUrl = (url)=>{
  if(process.env.NODE_ENV === 'development'){
    if(url.startsWith("/")){
      let devUrl = new URL(url,document.location.origin);
      devUrl.port = 3333
      return devUrl.toString()
    }
  }
  return url;
}