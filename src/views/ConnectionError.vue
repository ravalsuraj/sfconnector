<template>
  <div class="h-75 d-flex flex-column align-items-center justify-content-center">
    <h3 class="danger-text mb-4 pb-4 noselect">WARNING: CONNECTION LOST !</h3>
    <br>
    <h4>This may be due to network issues. Please refresh the page once you are connected</h4>

    <mdb-alert @closeAlert="hideAlert" dismiss :color="alertBanner.color" v-if="alertBanner.show">
      <strong>Warning!</strong>
      {{alertBanner.message}}
    </mdb-alert>
  </div>
</template>

<script>
//import AgentStateControl from '@/components/AgentStateControl.vue'

import { mdbContainer, mdbAlert } from "mdbvue";
import { APP_STATES } from "@/defines.js";
export default {
  name: "ConnectionError",
  components: {
    mdbContainer,
    mdbAlert
  },
  data() {
    return {
      alertBanner: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  mounted() {
    //this.addClickToDialListener();
  },
  methods: {
    addClickToDialListener() {
      let clickToDialListener = payload => {
        console.log("Clicked phone number: " + payload.returnValue);
      };

      // Register the listener.
      window.addEventListener("load", () => {
        sforce.opencti.onClickToDial({ listener: clickToDialListener });
      });
    },
    hideAlert() {
      this.alertBanner.message = "";
      this.alertBanner.color = "";
      this.alertBanner.show = false;
    },
    showAlert(color, message) {
      this.alertBanner.message = message;
      this.alertBanner.color = color;
      this.alertBanner.show = true;
    }
  },
  computed: {
    isAcdLoggedIn() {
      return this.$store.state.agent.acdLoginState;
    },
    isDialerLoggedIn() {
      return this.$store.state.agent.dialerLoginState;
    },
    CallRinging() {
      return this.$store.state.app.state === APP_STATES.CALL_RINGING;
    }
  },
  watch: {
    CallRinging(newState, oldState) {
      if (newState && !oldState) {
        this.showSoftphone();
      }
    },

    isDialerLoggedIn(newState, oldState) {
      if (newState === true) {
        this.showAlert(
          "danger",
          " Login into campaign dialer failed. \n You will not receive automated campaign calls. \n" +
            "Please log-out from the softphone and try logging in again, or contact the administrator if the problem persists"
        );
      } else if (newState === false) {
        this.hideAlert();
      }
    }
  }
};
</script>

<style scoped>
</style>

