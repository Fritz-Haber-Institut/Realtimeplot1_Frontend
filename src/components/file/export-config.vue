<template>
  <div class="mx-auto">
    <ButtonWithLoading class="mt-5" @clicked="getFileContents" :loading="reqLoading" icon="mdi-download" hasBg color="info">{{ $General.GetString('exportconfigtitle') }}</ButtonWithLoading>
    <BottomSheetAlert :open="sheetAlert.open" :type="sheetAlert.type" @close-sheet="closeBottomSheet">
      {{ sheetAlert.text }}
    </BottomSheetAlert>
  </div>
</template>

<script>
import { saveAs } from 'file-saver';
import ButtonWithLoading from '../button-with-loading.vue';
import BottomSheetAlert from '../bottom-sheet-alert.vue';

export default {
  components: {
    ButtonWithLoading,
    BottomSheetAlert,
  },
  data() {
    return {
      reqLoading: false,
      sheetAlert: {
        open: false,
        type: 'error',
        text: '',
      },
    };
  },
  methods: {
    getFileContents() {
      this.reqLoading = true;
      const reqConfig = {
        method: 'GET',
        url: this.$General.APIFileExport(),
        headers: {
          'x-access-tokens': this.$General.GetLSSettings().Token,
        },
        responseType: 'blob',
      };
      this.$Axios(reqConfig)
        .then(({ data, headers }) => {
          const fileName = headers['content-disposition'].split('filename=')[1].trim();
          saveAs(data, fileName);
          this.reqLoading = false;
        })
        .catch((e) => {
          e.response && console.log(e);
          e.response && this.showSheet('error', this.$General.sheetFileDownloadError(e.response.status));
        });
    },
    // UI Methods
    showSheet(type, text, doCloseDialog = true) {
      console.log('opa');
      this.sheetAlert.type = type;
      this.sheetAlert.text = text;
      this.sheetAlert.open = true;
      let time;
      if (type === 'error') {
        time = 4000;
      } else if (!doCloseDialog) {
        time = 3000;
      } else {
        time = 1000;
      }
      setTimeout(() => {
        this.closeBottomSheet();
      }, time);
    },
    closeBottomSheet() {
      this.sheetAlert.open = false;
    },
  },
};
</script>

<style>
</style>