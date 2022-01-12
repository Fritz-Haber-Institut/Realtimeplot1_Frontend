import Dictionary from "../subclasses/dictionary.json";
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';

export default {
  // APIs
  MainDomain: 'http://localhost:5000',
  APILogin() {
    return this.MainDomain + "/auth/get_access_token"
  },
  APIUsers() {
    return this.MainDomain + "/auth/users"
  },
  APIPVs() {
    return this.MainDomain + "/experiments/pvs"
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

  GetString: function (String, WantedLanguage) {
    try {
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
    }
    catch {
      //
    }
  },

  ConfirmAlert: function () {
    return Swal.fire({
      position: 'center',
      icon: 'warning',
      title: this.GetString('sure'),
      showCancelButton: true,
      confirmButtonColor: '#1C2D59',
      cancelButtonColor: '#CC4C4C',
      confirmButtonText: this.GetString('apply'),
      cancelButtonText: this.GetString('cancel'),
    }).then((Result) => {
      if (Result.isConfirmed) {
        return true
      }
      else {
        return false
      }
    });
  },

  // E-Mail validation Regex
  emailRegex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  // Default Messages
  maxCharactersAllowed: maxChars => `A maximum of ${maxChars} characters is allowed`,
  userTableUpdateDialogError: errorStatusCode => `Failed to save user changes. HTTP Error ${errorStatusCode}`,
  userTableNewUserDialogSuccess: (username, userType) => `New ${userType.toLowerCase()} ${username} saved successfully!`,
  userTableNewUserDialogError: errorStatusCode => `Failed to save a new user. HTTP Error ${errorStatusCode}`
}