<template>
  <v-card
    @drop.prevent="handleDrop($event)"
    @dragover.prevent="dragOver = true"
    @dragenter.prevent="dragOver = true"
    @dragleave.prevent="dragOver = false"
    @click="openFileDialog"
    :class="{ 'grey lighten-2 draggedOver': dragOver, 'pa-8': true}"
  >
    <v-card-text>
      <v-row class="d-flex flex-column" dense align="center" justify="center">
        <input v-show="false" ref="fileInput" type="file" accept="text/plain" @change="handleFileOpen" />
        <v-icon :class="dragOver ? 'mt-2, mb-6' : 'mt-5'" size="60">
          mdi-cloud-upload
        </v-icon>
        <p>
          {{ this.$General.GetString('fileUploadCopyText') }}
        </p>
      </v-row>
      <v-row v-if="file" justify="center" align="center" class="mb-3">
        {{ file.name }}
        <v-btn @click.stop="removeFile" icon>
          <v-icon> mdi-close-circle </v-icon>
        </v-btn>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn :disabled="file === null" @click.stop="uploadFileContents">
        <v-icon left>mdi-upload</v-icon>
        Upload
      </v-btn>
      <v-spacer></v-spacer>
    </v-card-actions>
    <v-alert v-if="summaryLines.length > 0" class="d-flex justify-center mt-3" type="error" rounded="lg" dark>
      <div id="errorLines">
        <div v-for="(line, idx) in errorLines" :key=idx>
          {{ line }}
        </div>
      </div>
      <div id="summaryLines" class="mt-5">
        <strong>Summary</strong>
        <div v-for="(line, idx) in summaryLines" :key=idx>
          {{ line }}
        </div>
      </div>
    </v-alert>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </v-card>
</template>

<script>
import BottomSheetAlert from '../bottom-sheet-alert.vue'

export default {
  components: {
    BottomSheetAlert
  },
  data() {
    return {
      dragOver: false,
      file: null,
      sheetAlert: {
        open: false,
        type: 'sucess',
        text: '',
      },
      errorLines: [],
      summaryLines: []
    }
  },
  methods: {
    handleDrop(e) {
      this.dragOver = false
      this.errorLines = []
      this.summaryLines = []

      if (e.dataTransfer.files[0].type !== 'text/plain') {
        this.showSheet('error', this.$General.GetString('sheetFileUploadWrongFormat'))
      } else {
        this.file = e.dataTransfer.files[0]
      }
    },
    openFileDialog() {
      this.$refs.fileInput.click()
    },
    handleFileOpen() {
      this.errorLines = []
      this.summaryLines= []
      this.file = this.$refs.fileInput.files[0]
    },
    removeFile() {
      this.file = null
    },
    async uploadFileContents() {
      if (this.file) {
        const fileContents = await this.file.text()
        
        const reqConfig = {
          method: 'POST',
          url: this.$General.APIFileImport(),
          headers: {
            "x-access-tokens": this.$General.GetLSSettings().Token,
            "Content-Type": "text/plain"
          },
          data: fileContents
        }

        this.$Axios(reqConfig)
        .then(({data}) => {
          if (data.errors.length > 0) {
            const expInFile = data.number_of_experiments_found_in_file
            const expInDB = data.number_of_experiments_now_in_database
            const PVsInFile = data.number_of_process_variables_found_in_file
            const PVsInDB = data.number_of_process_variables_now_in_database
            data.errors.forEach(err => {
              this.errorLines.push(err)
              console.log(err)
            })
            this.summaryLines.push(`Count of experiments in the file: ${expInFile}`)
            this.summaryLines.push(`Total count of experiments in the database: ${expInDB}`)
            this.summaryLines.push(`Count of PVs in the file: ${PVsInFile}`)
            this.summaryLines.push(`Total count of experiments in the database: ${PVsInDB}`)      
          } else {
            this.showSheet("success", this.$General.GetString('sheetFileImportSuccess'))
            this.file = null
          }
        })
        .catch(e => {
          console.log(e)
          e.response && this.$General.sheetFileImportError(e.response.status)
        })
      }
    },
    // UI Methods
    showSheet(type, text, doCloseDialog = true) {
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time
      if (type === 'error') {
        time = 4000
      } else if (!doCloseDialog) {
        time = 3000
      } else {
        time = 1000
      }
      setTimeout(() => {
        this.closeBottomSheet()
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false
    },
  }
}
</script>

<style>
  .grey.lighten-2.draggedOver {
    border: 2px black dashed !important;
    box-shadow: none !important;
  }
</style>