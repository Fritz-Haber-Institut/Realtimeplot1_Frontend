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
          headers: { 
            'Content-Type': 'application/json', 
            'x-access-tokens': Authorization 
          }
        }
      }
      else {
        return {
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': (Authorization != null) ? 'Basic ' + Authorization : '' 
          }
        }
      }
    },
    // E-Mail validation Regex
    emailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    // Default Messages
    NoEmpty: 'Field cannot be empty!',
    WrongInfos: 'Wrong E-Mail or password!',
    WrongInfos2: 'Informations are not Complete',
    WrongInfos3: 'Username already exists',    
    WrongEmailFormat: 'Wrong E-Mail format!',
    Success: 'Operations successfully completed!',
    DoubleEmail: 'Email already exists',
    passwordsDontMatch: 'Password values do not match',
    maxCharactersAllowed: maxChars => `A maximum of ${maxChars} characters is allowed`,
    userTableUpdateDialogSuccess: 'User changes saved successfully!',
    userTableUpdateDialogError: errorStatusCode => `Failed to save user changes. HTTP Error ${errorStatusCode}`,
    userTableNewUserDialogSuccess: (username, userType) => `New ${userType.toLowerCase()} ${username} saved successfully!`,
    userTableNewUserDialogError: errorStatusCode => `Failed to save a new user. HTTP Error ${errorStatusCode}`,
    userTableDeleteDialogSuccess: 'User deleted successfully!',
    userTableDeleteDialogError: (username, errorStatusCode) => `Failed to delete user ${username}. HTTP Error ${errorStatusCode}`,
}