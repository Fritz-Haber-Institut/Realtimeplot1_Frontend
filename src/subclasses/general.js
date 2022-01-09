import Dictionary from "../subclasses/dictionary.json";

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

  GetString: function (String, WantedLanguage) {
    if (WantedLanguage == null) {
      var Language = this.GetLSSettings().preferred_language;
      try {
        return Dictionary.Strings.find(Word => Word.value === String)[Language]
      }
      catch
      {
        console.log("404 '" + Language + "' : " + String);
      }
    }
    else {
      try {
        return Dictionary.Strings.find(Word => Word.value === String)[WantedLanguage]
      }
      catch
      {
        console.log("404 '" + WantedLanguage + "' : " + String);
      }
    }
  },
}