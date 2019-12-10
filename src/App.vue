<template>
  <div id="app" class="d-flex flex-column">
    <top-navbar v-if="isAppStateNotLoggedOut"></top-navbar>
    <main-content></main-content>
    <bottom-statusbar></bottom-statusbar>
    <notifications group="success" position="bottom center" type="success" width="100%" />
    <notifications group="warn" position="bottom center" type="warn" width="100%" />
    <notifications group="error" position="bottom center" type="error" width="100%" />
  </div>
</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";
import TopNavbar from "@/views/layout/TopNavbar.vue";
import MainContent from "@/views/layout/MainContent.vue";
import BottomStatusbar from "@/views/layout/BottomStatusbar.vue";

import { APP_STATES, AGENT_STATES, TIMER_STATES } from "@/defines.js";
export default {
  name: "App",
  components: {
    TopNavbar,
    MainContent,
    BottomStatusbar
  },
  data() {
    return {
      tabId: null
    };
  },
  beforeCreate() {
    console.log("App(): lifecycle hook called -- beforeCreate");
  },
  created() {
    console.log("App(): lifecycle hook called -- created");
  },
  beforeMount() {
    console.log("App(): lifecycle hook called -- beforeMount");

  },
  mounted() {
    console.log("CTI Connector App mounted");
    this.$store.dispatch("processOnAppMounted");
    this.$store.dispatch("onClickToDial");
  },
  sockets: {
    connect() {
      console.log("--------------socket connected--------------");
      this.$store.dispatch("processConnectionRestored");
    },
    disconnect() {
      console.log("--------------socket disconnected--------------");
    },
    connect_error() {
      console.log("--------------socket connect_error--------------");
      this.$store.dispatch("processConnectionError");
    },
    connect_timeout() {
      console.log("--------------socket connect_timeout--------------");
    }
  },
  methods: {
    // getCountryCodeVirtualNumberFromLead(leadId) {
    //   /******************Get Country Code Start**********************/
    //   console.log("getCountryCodeVirtualNumberFromLead() entered function");
    //   let param = {
    //     apexClass: "CTI_OpenCTIConnector",
    //     methodName: "getCountryCodeVirtualNumberFromLead",
    //     methodParams: "strLeadId=" + leadId
    //   };

    //   param.callback = response => {
    //     if (response.success) {
    //       console.log(
    //         "getCountryCodeVirtualNumberFromLead(): response successful. response.returnValue.runApex=",
    //         response.returnValue.runApex
    //       );
    //       let jsonResp = JSON.parse(response.returnValue.runApex);
    //       this.$store.commit(
    //         "setCallVirtualNumber",
    //         jsonResp.Virtual_Number_Text__c
    //       );
    //       this.$store.commit("setCallCountryCode", jsonResp.Country_Code__c);
    //       this.makeOutboundCall();
    //     } else {
    //       console.error(
    //         "getCountryCodeVirtualNumberFromLead(): response failure. response.errors=",
    //         response.errors
    //       );
    //     }
    //   };
    //   sforce.opencti.runApex(param);
    // },

    // makeOutboundCall() {
    //   let countryCodeWithoutPlus = this.countryCode.replace("+", "00");
    //   if (countryCodeWithoutPlus === "0091") {
    //     countryCodeWithoutPlus = "";
    //   }
    //   let outboundCallNumber =
    //     "91" + countryCodeWithoutPlus + this.customerNumber;
    //   let outboundCallRequest = {
    //     header: this.sessionParams,
    //     body: {
    //       targetNumber: outboundCallNumber
    //     }
    //   };

    //   IcwsConnector.createOutboundCall(outboundCallRequest)
    //     .then(resp => {
    //       console.log(
    //         "icwsCreateOutboundCall(): response successful. resp=",
    //         resp
    //       );

    //       if (resp.data.responseCode === 0) {
    //         console.log("icwsCreateOutboundCall(): Successful", resp);

    //         this.$store.commit("resetCallProcesses");
    //         this.$store.dispatch(
    //           "icws_updateAgentStatusMessage",
    //           "Outbound Call"
    //         );
    //       } else {
    //         console.log(
    //           "icwsCreateOutboundCall(): Response received but not successful" +
    //             resp
    //         );
    //       }
    //     })
    //     .catch(error => {
    //       console.log("icwsCreateOutboundCall(): response failed: ", error);
    //     });
    // },

    addAppViewChangeListener() {
      sforce.opencti.getAppViewInfo({
        callback: response => {
          if (response.success) {
            console.log(
              "addAppViewChangeListener() executed successfully! returnValue:",
              response.returnValue
            );
          } else {
            console.error(
              "addAppViewChangeListener() returned Errors:",
              response.errors
            );
          }
        }
      });
    }
  },
  computed: {
    joinRoomRequest() {
      return this.$store.getters.socketRequestParams;
    },
    isAgentLoggedIn() {
      return this.$store.getters.agentLoginState === AGENT_STATES.LOG_IN;
    },

    isAppStateLoggedIn() {
      return this.$store.getters.appState === APP_STATES.LOGGED_IN;
    },

    isAppStateNotLoggedOut() {
      return (
        this.$store.state.app.state !== APP_STATES.LOGGED_OUT &&
        this.$store.state.app.state !== APP_STATES.CONNECTION_ERROR
      );
    },
    sessionParams() {
      return this.$store.getters.sessionParams;
    },
    countryCode() {
      return this.$store.getters.countryCode;
    },
    customerNumber() {
      return this.$store.getters.customerNumber;
    },
    timerControl() {
      return this.$store.getters.getTimerControl;
    },
    timerState() {
      return this.$store.getters.getTimerState;
    }
  },

  watch: {
    timerControl(newTimerCommand, oldTimerCommand) {
      try {
        console.log(
          "timerControl watch: value changed from: ",
          oldTimerCommand,
          " to ",
          newTimerCommand
        );
        // if (oldTimerCommand === TIMER_STATES.CONTROL.STOP) {
        if (newTimerCommand === TIMER_STATES.CONTROL.START) {
          this.$store.dispatch("startTicking");
          // }
        }
        //  else if (oldTimerCommand === TIMER_STATES.CONTROL.START) {
        if (
          newTimerCommand === TIMER_STATES.CONTROL.STOP ||
          newTimerCommand === TIMER_STATES.EVENTS.EXPIRED
        ) {
          this.$store.dispatch("stopTicking");
          // }
        }
      } catch (error) {
        console.error(error);
      }
    },
    timerState(newTimerState, oldTimerState) {
      console.log(
        "timer state changed from " + oldTimerState + " to " + newTimerState
      );
      if (
        oldTimerState !== TIMER_STATES.EVENTS.EXPIRED &&
        newTimerState === TIMER_STATES.EVENTS.EXPIRED
      ) {
        console.log("timerState()/watch: Timer expired, so disposing the call");
        this.$store.dispatch("isThisMasterTab").then(isMasterTab => {
          if (isMasterTab) {
            this.$store.dispatch("manualDisposeCall", "Available");
          }
        });
      }
    }
  }
};
</script>


<style lang="scss">
html {
  font-size: 75%;
  color: rgba(0, 0, 0, 0.45);
}

#app {
  height: 325px;
  // font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  // color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

.main-body {
  height: 290px;
  overflow-y: auto;
  background: linear-gradient(#fff, rgb(243, 243, 243));
  /* background: rgba(204, 0, 0, 1);
  background: -moz-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -webkit-gradient(
    left top,
    right top,
    color-stop(0%, rgba(204, 0, 0, 1)),
    color-stop(100%, rgba(255, 102, 0, 1))
  );
  background: -webkit-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -o-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -ms-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: linear-gradient(
    to right,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(
    startColorstr='#cc0000', endColorstr='#ff6600',
    GradientType=1 ); */
}
footer {
  height: 25px;
}

@media (min-width: 992px) {
  .col-lg-2p5 {
    -ms-flex: 0 0 20.833333%;
    flex: 0 0 20.833333%;
    max-width: 20.833333%;
  }
}

.fl_widget {
  margin-bottom: 10px !important;
}

.fl_btn_btnIcon i {
  color: #9e9e9e;
}
.fl_btn_btnIcon:hover i {
  color: #00bcd4;
}
.fl_btn_btnIcon:active i {
  color: #0097a7;
}
.fl-color-agc {
  background: rgba(204, 0, 0, 1);
  background: -moz-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );

  .fl_notif {
    bottom: 30px;
  }
  .fl_notification_bulb {
  border: rgba(0, 0, 0, 0.25) 1px solid;
  border-radius: 50%;
  box-shadow: inset 0px 1px 3px 5px rgba(0, 0, 0, 0.75);
}
  background: -webkit-gradient(
    left top,
    right top,
    color-stop(0%, rgba(204, 0, 0, 1)),
    color-stop(100%, rgba(255, 102, 0, 1))
  );
  background: -webkit-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -o-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: -ms-linear-gradient(
    left,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  background: linear-gradient(
    to right,
    rgba(204, 0, 0, 1) 0%,
    rgba(255, 102, 0, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(
    startColorstr='#cc0000', endColorstr='#ff6600',
    GradientType=1 );
}
.fa-1p5x {
  font-size: 1.5em;
}
.btn-circle {
  width: 30px;
  height: 30px;
  text-align: center;
  padding: 6px 0;
  font-size: 12px;
  line-height: 1.428571429;
  border-radius: 15px;
}
.btn-circle.btn-lg {
  width: 50px;
  height: 50px;
  padding: 10px 16px;
  font-size: 18px;
  line-height: 1.33;
  border-radius: 25px;
}
.btn-circle.btn-xl {
  width: 70px;
  height: 70px;
  padding: 10px 16px;
  font-size: 24px;
  line-height: 1.33;
  border-radius: 35px;
}

/******************Slide Animation Styles********************/

.slide-enter-active {
  -moz-transition-duration: 0.4s;
  -webkit-transition-duration: 0.4s;
  -o-transition-duration: 0.4s;
  transition-duration: 0.4s;

  transition-timing-function: linear;
}

.slide-leave-active {
  -moz-transition-duration: 0.8s;
  -webkit-transition-duration: 0.8s;
  -o-transition-duration: 0.8s;
  transition-duration: 0.8s;
  -moz-transition-timing-function: linear;
  -webkit-transition-timing-function: linear;
  -o-transition-timing-function: linear;
  transition-timing-function: linear;
}

.slide-enter-to,
.slide-leave {
  max-height: 100px;
  overflow: hidden;
}

.slide-enter,
.slide-leave-to {
  overflow: hidden;
  max-height: 0;
}

.flip-list-move {
  transition: transform 0.2s;
}

/******************Fade Animation Styles********************/

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter, .fade-leave-to
/* .-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.card {
  box-shadow: 3px 2px 15px 2px rgba(0, 0, 0, 0.16),
    0 2px 10px 0 rgba(0, 0, 0, 0.12) !important;
}

// .md-form .prefix.active {
//   /* color: #d63333; */
// }
</style>
<style scoped>
main {
  /* background: url("https://cdn-images-1.medium.com/max/2000/1*AcYLHh0_ve4TNRi6HLFcPA.jpeg"); */
  background-size: cover;
}
.fl_topSpacing {
  padding-top: 64px;
}
</style>
