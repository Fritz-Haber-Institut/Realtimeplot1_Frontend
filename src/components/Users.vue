<template>
  <v-container>
    <v-dialog v-model="Users.Dialog" max-width="700px">
      <Userform @clicked="onClickChild" :user="this.$props.user" :type="UserOp.Type" :target="UserOp.UserID" isInDialog />
    </v-dialog>
    <v-card>
      <v-card-actions>
        <v-alert icon="mdi-check-circle-outline" rounded="md" class="mx-2 mt-1" width="100%" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
          {{ GeneralValues.AlertMessage.Message }}
        </v-alert>
      </v-card-actions>
      <v-card-title>
        <v-text-field autocomplete="new-search" full-width hide-details="" prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="Users.Search"></v-text-field>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn fab color="info" class="ml-5" v-bind="attrs" v-on="on" @click="AddUser()">
              <v-icon> mdi-account-multiple-plus </v-icon>
            </v-btn>
          </template>
          {{ $General.GetString('addNewUserTooltip') }}
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <v-divider />
        <v-data-table :headers="Users.Headers" :items="Users.Items" :loading="Users.Loading" :no-results-text="$General.GetString('nodata')" :no-data-text="$General.GetString('nodata')" :loading-text="$General.GetString('loading')" :search="Users.Search">
          <template v-slot:[`item.user_type`]="{ item }">
            <v-chip class="Full100 justify-center" v-bind:color="item.user_type == 'Admin' ? 'success' : 'info'">{{ item.user_type }}</v-chip>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <v-btn fab color="warning" x-small @click="EditUser(item.url.split('/')[3])"><v-icon> mdi-pencil </v-icon></v-btn>
            <v-btn fab color="error" class="ml-2" x-small @click="DeleteUser(item.url.split('/')[3])"> <v-icon> mdi-delete </v-icon></v-btn>
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
    GeneralValues: {
      AlertMessage: {
        Message: '',
        Color: '',
      },
    },
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
    onClickChild(Value) {
      this.GeneralValues.AlertMessage.Message = Value.Message;
      this.GeneralValues.AlertMessage.Color = Value.Color;
      this.Users.Dialog = false;
    },
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
      const userLoginName = this.Users.Items.filter((userObj) => userObj.user_id === Value)[0].login_name;
      this.$General.ConfirmDeleteAlert('the user ' + userLoginName).then((Result) => {
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
      { value: 'settings', sortable: false, width:'105px' },
    ];
  },
};
</script>