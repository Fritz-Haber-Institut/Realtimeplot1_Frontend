<template>
  <v-card>
    <v-card-title>
      <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
    </v-card-title>
    <v-data-table :headers="headers" :items="users" :loading="isUsersEmpty" loading-text="Loading... Please wait" :search="search" class="data-table">
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialogNew" max-width="700px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on"> Add a new User </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ dialogTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="submit-new-user" lazy-validation v-model="formValidation.isNewUserFormValid" autocomplete="off">
                  <v-row>
                    <v-col cols="6">
                      <v-text-field label="First name" v-model="tempUser.first_name" :rules="nameRules"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field label="Last name" v-model="tempUser.last_name" :rules="nameRules"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="E-Mail" v-model="tempUser.email" :rules="emailRules"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field label="Username" v-model="tempUser.login_name" :rules="usernameRules"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field label="Password" v-model="tempUser.password" :append-icon="formValidation.showNewUserPassword1 ? 'mdi-eye' : 'mdi-eye-off'" @click:append="formValidation.showNewUserPassword1 = !formValidation.showNewUserPassword1" :type="formValidation.showNewUserPassword1 ? 'text' : 'password'" :counter="formValidation.maxCharacters" :rules="newUserPasswordRules"></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field label="Confirm Password" v-model="formValidation.confirmedPassword" :append-icon="formValidation.showNewUserConfirmedPassword ? 'mdi-eye' : 'mdi-eye-off'" :type="formValidation.showNewUserConfirmedPassword ? 'text' : 'password'" @click:append="formValidation.showNewUserConfirmedPassword = !formValidation.showNewUserConfirmedPassword"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-radio-group v-model="tempUser.user_type" label="User Role" :rules="radioGroupRules" mandatory>
                        <v-radio :label="'User'" :value="'User'"></v-radio>
                        <v-radio :label="'Admin'" :value="'Admin'"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col cols="12">
                      <v-btn color="blue" block dark @click="createNewUser"> Save New User </v-btn>
                    </v-col>
                  </v-row>
                  <v-row v-show="dialogAlert.isVisible">
                    <v-col>
                      <v-alert :value="dialogAlert.isVisible" :type="dialogAlert.type" transition="fade-transition">
                        {{ dialogAlert.text }}
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogUpdate" max-width="700px">
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ dialogTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="submit-edited-user" lazy-validation v-model="formValidation.isEditedUserFormValid" autocomplete="off">
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field v-model="tempUser.first_name" @keydown="activateUpdateUserButton" :rules="nameRules" label="First Name"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field v-model="tempUser.last_name" @keydown="activateUpdateUserButton" :rules="nameRules" label="Last Name"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="12">
                      <v-text-field v-model="tempUser.email" @keydown="activateUpdateUserButton" :rules="emailRules" label="E-Mail"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field v-model="tempUser.login_name" @keydown="activateUpdateUserButton" :rules="usernameRules" label="Username"></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field v-model="tempUser.password" @keydown="activateUpdateUserButton" :counter="formValidation.maxCharacters" :rules="registeredUserPasswordRules" type="password" label="New Password"></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-radio-group v-model="tempUser.user_type" @change="activateUpdateUserButton" label="User Role" :rules="radioGroupRules" required>
                        <v-radio :label="'User'" :value="'User'"></v-radio>
                        <v-radio :label="'Admin'" :value="'Admin'"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-alert :value="dialogAlert.isVisible" :type="dialogAlert.type" transition="fade-transition" max-width="50%">
                  {{ dialogAlert.text }}
                </v-alert>
              </v-card-actions>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeNewOrUpdateDialog('update')"> Cancel </v-btn>
                <v-btn color="blue darken-1" text @click="saveUserChanges" :disabled="!isUpdateUserButtonActive"> Update User </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="text-h5">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDeleteDialog">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="deleteUserConfirm">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small class="mr-2" @click="editUser(item)"> mdi-pencil </v-icon>
        <v-icon small @click="deleteUser(item)"> mdi-delete </v-icon>
      </template>
      <!-- <template v-slot:no-data>
        <v-btn
          color="primary"
          @click="initialize"
        >
          Reset
        </v-btn>
      </template> -->
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      search: '',
      isUpdateUserButtonActive: false,
      dialogNew: false,
      dialogUpdate: false,
      dialogDelete: false,
      dialogAlert: {
        isVisible: false,
        type: 'success',
        text: '',
      },
      dialogCloseTimeout: 1500,
      headers: [
        {
          text: 'User',
          value: 'login_name',
        },
        {
          text: 'First Name',
          value: 'first_name',
        },
        {
          text: 'Last Name',
          value: 'last_name',
        },
        {
          text: 'E-Mail',
          value: 'email',
        },
        {
          text: 'User Role',
          value: 'user_type',
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: 'false',
        },
      ],
      editedIndex: -1,
      tempUser: {
        login_name: '',
        first_name: '',
        last_name: '',
        email: '',
        user_type: '',
        password: '',
      },
      defaultUser: {
        login_name: '',
        first_name: '',
        last_name: '',
        email: '',
        user_type: '',
        password: '',
      },
      formValidation: {
        isNewUserFormValid: true,
        isEditedUserFormValid: true,
        showNewUserPassword1: false,
        showNewUserConfirmedPassword: false,
        maxCharacters: 0, // rule turned off
        confirmedPassword: '',
      },
    };
  },
  computed: {
    isUsersEmpty() {
      return this.users.length === 0;
    },
    isUpdateDialogActive() {
      return this.editedIndex > -1;
    },
    dialogTitle() {
      const currentUsername = `${this.tempUser.login_name}`;
      return this.isUpdateDialogActive ? `Edit User ${currentUsername}` : 'New User';
    },
    generalFormRules() {
      return [(v) => !!v || this.$General.NoEmpty, (v) => (v || '').indexOf(' ') < 0 || 'No spaces are allowed'];
    },
    nameRules() {
      const rules = [];
      return this.generalFormRules.concat(rules);
    },
    usernameRules() {
      const rules = [];
      return this.generalFormRules.concat(rules);
    },
    generalPasswordRules() {
      const rules = [];
      if (this.formValidation.maxCharacters) {
        const maxRule = (v) => (v || '').length <= this.formValidation.maxCharacters || this.$General.maxCharactersAllowed(this.formValidation.maxCharacters);
        rules.push(maxRule);
      }
      return this.generalFormRules.concat(rules);
    },
    registeredUserPasswordRules() {
      return this.tempUser.password ? this.generalPasswordRules : [true];
    },
    newUserPasswordRules() {
      const rules = [(v) => (!!v && v) === this.formValidation.confirmedPassword || this.$General.passwordsDontMatch];
      return this.generalPasswordRules.concat(rules);
    },
    emailRules() {
      const rules = [(v) => this.$General.emailRegex.test(v) || this.$General.WrongEmailFormat];
      return this.generalFormRules.concat(rules);
    },
    radioGroupRules() {
      return [this.generalFormRules[0]];
    },
  },
  methods: {
    editUser(user) {
      this.editedIndex = this.users.indexOf(user);
      this.tempUser = Object.assign({}, user);
      this.dialogUpdate = true;
    },
    deleteUser(user) {
      this.editedIndex = this.users.indexOf(user);
      this.tempUser = Object.assign({}, user);
      this.dialogDelete = true;
    },
    activateUpdateUserButton() {
      this.isUpdateUserButtonActive = true;
    },
    deleteUserConfirm() {
      this.users.splice(this.editedIndex, 1);
      this.closeDeleteDialog();
    },
    closeNewOrUpdateDialog(dialogType) {
      if (dialogType === 'new') {
        this.dialogNew = false;
      } else {
        this.dialogUpdate = false;
        this.isUpdateUserButtonActive = false;
      }

      this.$nextTick(() => {
        this.tempUser = Object.assign({}, this.defaultUser);
        this.dialogAlert.isVisible = false;
        this.editedIndex = -1;
      });
    },
    closeDeleteDialog() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },
    validateUserForm() {
      if (this.$refs['submit-new-user']) {
        this.validateNewUserForm();
      } else if (this.$refs['submit-edited-user']) {
        this.validateUpdateUserForm();
      }
    },
    validateNewUserForm() {
      return this.$refs['submit-new-user'].validate();
    },
    validateUpdateUserForm() {
      return this.$refs['submit-edited-user'].validate();
    },
    createNewUser() {
      if (this.validateNewUserForm()) {
        const requestConfig = {
          method: 'POST',
          url: this.$General.APIUsers(),
          headers: {
            'x-access-tokens': this.$General.GetLSSettings().Token,
            'Content-Type': 'application/json',
          },
          data: this.tempUser,
        };
        this.$Axios(requestConfig)
          .then(() => {
            this.dialogAlert.isVisible = true;
            this.dialogAlert.type = 'success';
            this.dialogAlert.text = this.$General.userTableNewUserDialogSuccess(this.tempUser.user_type, this.tempUser.login_name);
            this.$emit('reload-users');
          })
          .catch((e) => {
            console.log(`Failed to save a new user. Error status: ${e.response.status} ${e.response.statusText}`);
            this.dialogAlert.isVisible = true;
            this.dialogAlert.type = 'error';
            this.dialogAlert.text = this.$General.userTableNewUserDialogError(e.response.status);
          });
        setTimeout(() => {
          this.dialogAlert.isVisible && this.dialogAlert.type === 'success' && this.closeNewOrUpdateDialog('new');
        }, this.dialogCloseTimeout);
      }
    },
    saveUserChanges() {
      if (this.editedIndex > -1 && this.validateUpdateUserForm()) {
        let editedUserData = Object.assign({}, this.tempUser);
        // If the password was not changed, i.e. the password field in the update dialog remained empty,
        // no password property should be transfered to the server. The user password was not updated and should remain the same.
        if (!editedUserData.password) {
          delete editedUserData.password;
        }
        const requestConfig = {
          method: 'PUT',
          url: this.$General.MainDomain + this.tempUser.url,
          headers: {
            'x-access-tokens': this.$General.GetLSSettings().Token,
            'Content-Type': 'application/json',
          },
          data: editedUserData,
        };
        this.$Axios(requestConfig)
          .then(() => {
            this.dialogAlert.isVisible = true;
            this.dialogAlert.type = 'success';
            this.dialogAlert.text = this.$General.userTableUpdateDialogSuccess;
            this.$emit('reload-users');
          })
          .catch((e) => {
            console.log(`Failed to update user data. Error status: ${e.response.status} ${e.response.statusText}`);
            this.dialogAlert.isVisible = true;
            this.dialogAlert.type = 'error';
            this.dialogAlert.text = this.$General.userTableUpdateDialogError(e.response.status);
          });
        setTimeout(() => {
          this.dialogAlert.isVisible && this.dialogAlert.type === 'success' && this.closeNewOrUpdateDialog('update');
        }, this.dialogCloseTimeout);
      }
    },
  },
  watch: {
    dialogNew(val) {
      val || this.closeNewOrUpdateDialog('new');
    },
    dialogUpdate(val) {
      val || this.closeNewOrUpdateDialog('update');
    },
    dialogDelete(val) {
      val || this.closeDeleteDialog();
    },
    'tempUser.password': 'validateUserForm',
    'formValidation.confirmedPassword': 'validateUserForm',
    'formValidation.maxCharacters': 'validateUserForm',
  },
};
</script>

<style scoped>
.data-table {
  /* margin: 50px auto 0;
  max-width: 80%; */
  /* border: 1px solid black; */
}
</style>