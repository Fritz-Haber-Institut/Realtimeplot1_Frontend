export default {
    // APIs
    MainDomain: 'http://localhost:5000',
    APILogin() { 
      return this.MainDomain + "/auth/get_access_token"
    },
    APIUsers() {
      return this.MainDomain + "/auth/users"
    },
    // General Functions
    LSSettings: 'ZgjdLNewsboV3LRxOgaw',
    GetLSSettings() {
      return JSON.parse(localStorage.getItem(this.LSSettings))
    },
    SetLSSettings(NewLSSetting) {
      return localStorage.setItem(this.LSSettings, JSON.stringify(NewLSSetting))
    },
    ReloadPage(URL) {
      return URL === null ? window.location.reload() : window.location.replace(URL)
    },
    GetHeaderValue(Authorization, Bearer) {
      if (Bearer) {
        return { 
          headers: { 'Content-Type': 'application/json', 'x-access-tokens': Authorization }
        }
      }
      else {
        return {
          headers: { 'Content-Type': 'application/json', 'Authorization': (Authorization != null) ? 'Basic ' + Authorization : '' }
        }
      }
    },
    // Default Messages
    NoEmpty: 'Field cannot be empty!',
    WrongInfos: 'Wrong email or password!',
    WrongInfos2: 'Informations are not Complete',
    WrongInfos3: 'Username already exists',    
    WrongEmailFormat: 'Wrong Email format!',
    Success: 'Operations successfully completed!',
    DoubleEmail: 'Email already exists'
}