<template>
  <v-container>
    <v-dialog v-model="Users.Dialog" width="700px">
      <Userform v-if="Users.Dialog" @clicked="onClickChild" :type="UserOp.Type" :target="UserOp.UserID" @reload-data="loadData" @close-dialog="Users.Dialog = false" />
    </v-dialog>
    <v-card>
      <v-card-actions>
        <v-alert icon="mdi-check-circle" rounded="md" class="mx-2 mt-1" width="100%" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark v-html="GeneralValues.AlertMessage.Message">
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
        <v-data-table :headers="headers" :items="Users.Items" :loading="Users.Loading" :no-results-text="$General.GetString('nodata')" :no-data-text="$General.GetString('nodata')" :loading-text="$General.GetString('loading')" :search="Users.Search">
          <template v-slot:[`item.user_type`]="{ item }">
            <v-chip class="Full100 justify-center" v-bind:color="item.user_type == 'Admin' ? 'success' : 'info'">{{ item.user_type }}</v-chip>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <v-btn v-if="item.login_name !== currentUser.login_name" fab color="warning" x-small @click="EditUser(item.url.split('/')[3])"><v-icon> mdi-pencil </v-icon></v-btn>
            <v-btn v-if="item.login_name !== currentUser.login_name" fab color="error" class="ml-2" x-small @click="DeleteUser(item.url.split('/')[3])"> <v-icon> mdi-delete </v-icon></v-btn>
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
    currentUser: {
      login_name: ''
    },
    Users: {
      Loading: true,
      Dialog: false,
      OpType: null,
      Items: [],
    },
    UserOp: {
      Type: null,
      UserID: null,
    },
  }),
  computed: {
    headers() {
      return [
        { text: this.$General.GetString('loginname'), value: 'login_name' },
        { text: this.$General.GetString('firstname'), value: 'first_name' },
        { text: this.$General.GetString('lastname'), value: 'last_name' },
        { text: this.$General.GetString('userrole'), value: 'user_type' },
        { text: this.$General.GetString('email'), value: 'email' },
        { value: 'settings', sortable: false, width: '105px' }
      ]
    }
  },
  watch: {
    'Users.Dialog'(Value) {
      if (!Value) {
        this.GetUsers();
      }
    },
  },
  methods: {
    onClickChild(Value) {
      this.GeneralValues.AlertMessage.Message = Value.Message;
      this.GeneralValues.AlertMessage.Color = Value.Color;
      this.Users.Dialog = false;
    },
    loadData() {
      this.getCurrentUser()
      .then(this.GetUsers())
      .catch(e => console.log(e))
    },
    getCurrentUser() {
      return this.$Axios
        .get(this.$General.APIUsers() + '/current', this.$General.GetHeaderValue(this.$General.GetLSSettings('Token'), true))
        .then(({data}) => this.currentUser.login_name = data.user.login_name)
        .catch(e => console.log(e))
    },
    GetUsers() {
      var AxiosConfig = { method: 'GET', url: this.$General.APIUsers(), headers: { 'x-access-tokens': this.$General.GetLSSettings('Token'), 'Content-Type': 'application/json' } };
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
          var AxiosConfig = { method: 'DELETE', url: this.$General.APIUsers() + '/' + Value, headers: { 'x-access-tokens': this.$General.GetLSSettings('Token'), 'Content-Type': 'application/json' } };
          this.$Axios(AxiosConfig)
            .then(() => {
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
    this.loadData()
  },
};
</script>