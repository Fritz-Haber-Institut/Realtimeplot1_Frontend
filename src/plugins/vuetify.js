import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import General from '../subclasses/general.js';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

var ThemeMode = (General.GetLSSettings() == null) ? false : Boolean(General.GetLSSettings().dark_theme);
export default new Vuetify({
    theme: {
        dark: ThemeMode,
        themes: {
            light: {
                primary: colors.blue.darken1,
                secondary: colors.grey.darken3,
                accent: colors.deepOrange.darken4,
                error: colors.red.darken1,
                info: colors.blue.darken1,
                success: colors.green.darken1,       
            },
            dark: {
                primary: colors.blue.darken1,
                secondary: colors.white,
                accent: colors.deepOrange.darken4,
                error: colors.red.darken1,
                info: colors.blue.darken1,
                success: colors.green.darken1,                 
            },            
        },
    },
});