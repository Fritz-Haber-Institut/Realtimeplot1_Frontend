<template>
  <v-card>
    <v-card-title>
      Users
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="users"
      :loading="isUsersEmpty"
      loading-text="Loading... Please wait"
      :search="search"
      class="data-table"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-spacer></v-spacer>
          <v-dialog
            v-model="dialogUpdate"
            max-width="700px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                dark
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                Add a new User
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">{{ formTitle }}</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedUser.login_name"
                        @keydown="activateSaveButton"
                        label="Username"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedUser.first_name"
                        @keydown="activateSaveButton"
                        label="First Name"
                      ></v-text-field>
                    </v-col>
                    <v-col
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <v-text-field
                        v-model="editedUser.last_name"
                        @keydown="activateSaveButton"
                        label="Last Name"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col
                      cols="12"
                      sm="6"
                      md="12"
                    >
                      <v-text-field
                        v-model="editedUser.email"
                        @keydown="activateSaveButton"
                        label="E-Mail"
                      ></v-text-field>
                      <v-text-field
                        v-model="editedUser.password"
                        @keydown="activateSaveButton"
                        label="New Password"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-radio-group
                      v-model="editedUser.user_type"
                      @change="activateSaveButton"
                      label="User Role"
                    >
                      <v-radio
                        :label="'User'"
                        :value="'User'"
                      ></v-radio>
                      <v-radio
                        :label="'Admin'"
                        :value="'Admin'"
                      ></v-radio>
                    </v-radio-group>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="closeUpdateDialog"
                >
                  Cancel
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="saveUserChanges"
                  :disabled="!isSaveButtonActive"
                >
                  Save
                </v-btn>
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
      <template
        v-slot:[`item.actions`]="{ item }"
      >
        <v-icon
          small
          class="mr-2"
          @click="editUser(item)"
        >
          mdi-pencil
        </v-icon>
        <v-icon
          small
          @click="deleteUser(item)"
        >
          mdi-delete
        </v-icon>
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
      dialogUpdate: false,
      dialogDelete: false,
      isSaveButtonActive: false,
      headers: [
        {
          text: 'User',
          value: 'login_name'
        },
        {
          text: 'First Name',
          value: 'first_name'
        },
        {
          text: 'Last Name',
          value: 'last_name'
        },
        {
          text: 'E-Mail',
          value: 'email'
        },
        {
          text: 'User Role',
          value: 'user_type'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: 'false'
        }
      ],
      editedIndex: -1,
      editedUser: {
        login_name: '',
        first_name: '',
        last_name: '',
        email: '',
        user_type: '',
        password: ''
      },
      defaultUser: {
        login_name: '',
        first_name: '',
        last_name: '',
        email: '',
        user_type: ''
      }
    }
  },
  computed: {
    isUsersEmpty() {
      return this.users.length === 0
    },
    formTitle() {
      return this.editedIndex === -1 ? 'New User' : 'Edit User'
    }
  },
  watch: {
    dialogUpdate(val) {
      val || this.closeUpdateDialog()
    },
    dialogDelete(val) {
      val || this.closeDeleteDialog()
    }
  },
  // created() {
  //   this.initialize()
  // },
  methods: {
    // initialize() {
    // },
    editUser(user) {
      this.editedIndex = this.users.indexOf(user)
      this.editedUser = Object.assign({}, user)
      this.dialogUpdate = true
    },
    deleteUser(user) {
      this.editedIndex = this.users.indexOf(user)
      this.editedUser = Object.assign({}, user)
      this.dialogDelete = true
    },
    activateSaveButton() {
      console.log('activation of save button')
      this.isSaveButtonActive = true
    },
    deleteUserConfirm() {
      this.users.splice(this.editedIndex, 1)
      this.closeDeleteDialog()
    },
    closeUpdateDialog() {
      this.dialogUpdate = false
      this.isSaveButtonActive = false
      this.$nextTick(() => {
        this.editedUser = Object.assign({}, this.defaultUser)
        this.editedIndex = -1
      })
    },
    closeDeleteDialog() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    saveUserChanges() {
      if (this.editedIndex > -1) {
        const requestConfig = {
          method: 'PUT',
          url: this.$General.MainDomain() + this.editedUser.url,
          headers: {
            'x-access-tokens': this.$General.GetLSSettings().Token,
            'Content-Type': 'application/json',
          },
          data: this.editedUser,
        }
        this.$Axios(requestConfig)
          .then(() => {
            this.$emit('reload-users')
          })
          .catch(e => {
            console.log(e)
          })
      } else {
        // this.users.push(this.editedUser)
      }
      this.closeUpdateDialog()
    }
  }
}
</script>

<style scoped>
.data-table {
  /* margin: 50px auto 0;
  max-width: 80%; */
  /* border: 1px solid black; */
}
</style>