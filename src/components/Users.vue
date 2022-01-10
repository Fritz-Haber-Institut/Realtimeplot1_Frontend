<template>
  <v-container fluid>
    <v-dialog v-model="Users.Dialog">
      <Userform v-if="Users.Dialog" :user="this.$props.user" :type="UserOp.Type" :target="UserOp.UserID" />
    </v-dialog>
    <v-card>
      <v-card-title>
        <v-text-field autocomplete="new-search" full-width hide-details="" filled prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="Users.Search"></v-text-field>
        <v-btn fab color="info" class="ml-5"><v-icon @click="AddUser()"> mdi-account-multiple-plus </v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <v-data-table :headers="Users.Headers" :items="Users.Items" :loading="Users.Loading" :no-results-text="$General.GetString('nodata')" :no-data-text="$General.GetString('nodata')" :loading-text="$General.GetString('loading')" :search="Users.Search">
          <template v-slot:[`item.settings`]="{ item }">
            <v-icon color="warning" small @click="EditUser(item.url.split('/')[3])"> mdi-pencil </v-icon>
            <v-icon color="error" small class="ml-2" @click="DeleteUser(item.url.split('/')[3])"> mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import Userform from '../components/Userform';
export default {
  components: {
    Userform,
  },
  data: () => ({
    Users: {
      Loading: true,
      Dialog: false,
      OpType: null,
      Headers: [],
      Items: [],
    },
    UserOp: {
      Dialog: false,
      Type: null,
      UserID: null,
    },
  }),
  watch: {
    'Users.Dialog'(Value) {
      if (!Value) {
        this.GetUsers();
      }
    },
    user(Value) {
      if (Value) {
        this.user = Value;
      }
    },
  },
  props: {
    user: {
      type: Object,
      requred: true,
    },
  },
  methods: {
    GetUsers() {
      var AxiosConfig = { method: 'GET', url: this.$General.APIUsers(), headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' } };
      this.$Axios(AxiosConfig)
        .then((UsersResult) => {
          this.Users.Items = UsersResult.data.users;
          this.Users.Loading = false;
        })
        .catch((Error) => {
          console.log(Error);
          this.Users.Loading = false;
        });
    },
    AddUser() {
      this.Users.Dialog = true;
      this.UserOp.Type = 'POST';
      this.UserOp.UserID = '';
    },
    EditUser(Value) {
      this.Users.Dialog = true;
      this.UserOp.Type = 'PUT';
      this.UserOp.UserID = '/' + Value;
    },
    DeleteUser(Value) {
      this.$General.ConfirmAlert().then((Result) => {
        if (Result) {
          var AxiosConfig = { method: 'DELETE', url: this.$General.APIUsers() + '/' + Value, headers: { 'x-access-tokens': this.$General.GetLSSettings().Token, 'Content-Type': 'application/json' } };
          this.$Axios(AxiosConfig)
            .then((Result) => {
              console.log(Result);
              this.GetUsers();
            })
            .catch((Error) => {
              console.log(Error);
            });
        }
      });
    },
  },
  mounted() {
    this.GetUsers();
    this.Users.Headers = [
      { text: this.$General.GetString('email'), value: 'email' },
      { text: this.$General.GetString('loginname'), value: 'login_name' },
      { text: this.$General.GetString('userrole'), value: 'user_type' },
      { text: this.$General.GetString('firstname'), value: 'first_name' },
      { text: this.$General.GetString('lastname'), value: 'last_name' },
      { value: 'settings', sortable: false },
    ];
  },
};
</script>