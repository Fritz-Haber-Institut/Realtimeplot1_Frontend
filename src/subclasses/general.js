export default {
    // APIs
    MainDomain: function () {
        return 'http://192.168.0.152:5000';
    },
    APILogin: function () { return this.MainDomain() + "/auth/get_access_token"; },
    APIUsers: function () { return this.MainDomain() + "/auth/users"; },

    // General Functions
    LSSettings: function () { return "ZgjdLNewsboV3LRxOgaw"; },
    GetLSSettings: function () { return JSON.parse(localStorage.getItem(this.LSSettings())); },
    SetLSSettings: function (NewLSSetting) {
        return localStorage.setItem(this.LSSettings(), JSON.stringify(NewLSSetting));
    },

    ReloadPage: function (URL) {
        if (URL == null) {
            return window.location.reload();
        }
        else {
            return window.location.replace(URL);
        }
    },

    GetHeaderValue: function (Authorization, Bearer) {
        if (Bearer) {
            return { headers: { 'Content-Type': 'application/json', 'Authorization': (Authorization != null) ? 'Bearer ' + Authorization : '' } };

        }
        else {
            return { headers: { 'Content-Type': 'application/json', 'Authorization': (Authorization != null) ? 'Basic ' + Authorization : '' } };
        }
    },

    // Default Messages
    NoEmpty: function () { return "Field cannot be empty!"; },
    WrongInfos: function () { return "Wrong email or password!"; },
    WrongEmailFormat: function () { return "Wrong Email format!"; },
}