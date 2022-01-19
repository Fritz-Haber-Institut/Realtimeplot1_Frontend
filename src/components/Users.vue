<template>
  <v-container fluid>
    <v-dialog v-model="Users.Dialog">
      <Userform v-if="Users.Dialog" @clicked="onClickChild" :user="this.$props.user" :type="UserOp.Type" :target="UserOp.UserID" />
    </v-dialog>
    <v-card>
      <v-card-actions>
        <v-alert icon="mdi-check-circle-outline" rounded="md" class="mx-2 mt-1" width="100%" v-if="GeneralValues.AlertMessage.Message != ''" :color="GeneralValues.AlertMessage.Color" dark>
          {{ GeneralValues.AlertMessage.Message }}
        </v-alert>
      </v-card-actions>
      <v-card-title>
        <v-text-field autocomplete="new-search" full-width hide-details="" filled prepend-inner-icon="mdi-magnify" :label="$General.GetString('search')" v-model="Users.Search"></v-text-field>
        <v-btn @click="AddUser()" fab color="info" class="ml-5"><v-icon> mdi-account-multiple-plus </v-icon></v-btn>
      </v-card-title>
      <v-card-text>
        <v-divider />
        <v-data-table :headers="Users.Headers" :items="Users.Items" :loading="Users.Loading" :no-results-text="$General.GetString('nodata')" :no-data-text="$General.GetString('nodata')" :loading-text="$General.GetString('loading')" :search="Users.Search">
          <template v-slot:[`item.user_type`]="{ item }">
            <v-chip :class="item.user_type == 'Admin' ? 'success' : 'info'" small> {{ item.user_type }} </v-chip>
          </template>
          <template v-slot:[`item.settings`]="{ item }">
            <v-row>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="info" fab x-small :to="'/users/experiments/' + item.url.split('/')[3]" v-bind="attrs" v-on="on"> <v-icon> mdi-playlist-star</v-icon> </v-btn>
                </template>
                <span>{{ $General.GetString('showexperiment') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="warning" fab x-small class="ml-2" @click="EditUser(item.url.split('/')[3])" v-bind="attrs" v-on="on"> <v-icon> mdi-pencil</v-icon> </v-btn>
                </template>
                <span>{{ $General.GetString('update') }}</span>
              </v-tooltip>

              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="error" fab x-small class="ml-2" @click="DeleteUser(item.url.split('/')[3])" v-bind="attrs" v-on="on"> <v-icon> mdi-delete</v-icon></v-btn>
                </template>
                <span>{{ $General.GetString('delete') }}</span>
              </v-tooltip>
            </v-row>
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
      { text: this.$General.GetString('loginname'), value: 'login_name' },
      { text: this.$General.GetString('firstname'), value: 'first_name' },
      { text: this.$General.GetString('lastname'), value: 'last_name' },
      { text: this.$General.GetString('email'), value: 'email' },
      { text: this.$General.GetString('userrole'), value: 'user_type', width: '120' },
      { value: 'settings', sortable: false, width: '150' },
    ];
  },
};
</script>