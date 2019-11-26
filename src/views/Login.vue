<template>
  <div fluid class="fl_corner_bg w-100">
    <!-- Material form login -->

    <mdb-row class="d-flex flex-fill justify-content-center pt-4">
      <!-- <div v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <div>
          <span v-for="error in errors">{{ error }}</span>
        </div>
      </div>-->
      <mdb-col col="lg-4" class style>
        <div class="h4 mx-auto d-flex align-items-baseline">
          <img src="@/assets/oberoi_logo.png" class alt="Responsive image" style="height: 30px" />
          <span class="mx-auto align-baseline h2">CTI Login</span>
        </div>

        <div class="grey-text" @keyup="handleEnterKeyForLogin">
          <mdb-input
            required
            label="Agent ID"
            icon="user"
            type="text"
            size="sm"
            v-model="inpCredentials.userId"
            :disabled="isLoginDisabled"
          />
          <mdb-input
            required
            label="Station ID"
            icon="phone"
            type="text"
            size="sm"
            v-model="inpCredentials.station"
            :disabled="isLoginDisabled"
          />
          <mdb-input
            required
            label="Password"
            icon="lock"
            type="password"
            size="sm"
            v-model="inpCredentials.password"
            :disabled="isLoginDisabled"
          />
        </div>

        <span class="spinner-border text-info float-left" v-if="spinner.show"></span>
        <div class="btn-group text-center my-2 w-100">
          <mdb-btn class="btn white-text unique-color mr-3" size @click="performAgentLogin">Log in</mdb-btn>

          <!-- <mdb-btn class="btn white-text special-color" @click="checkMasterTab">Test Button</mdb-btn> -->
        </div>
        <!-- <mdb-alert>{{alertBanner.message}}</mdb-alert> -->

        <mdb-alert
          @closeAlert="hideAlert"
          dismiss
          :color="alertBanner.color"
          v-if="alertBanner.show"
        >
          <strong>Warning!</strong>
          {{alertBanner.message}}
        </mdb-alert>
      </mdb-col>
    </mdb-row>
  </div>
</template>

<script>
import { mdbAlert, mdbRow, mdbCol, mdbBtn, mdbInput } from "mdbvue";

import IcwsConnector from "@/services/icwsConnector.js";
import Utils from "@/services/utils.js";
export default {
  name: "LoginPage",
  components: {
    mdbAlert,

    mdbRow,
    mdbCol,
    mdbBtn,
    mdbInput
  },
  mounted() {
    //this.$store.dispatch("sf_getUserDetails");
    this.$store.dispatch("showSoftphone");
    this.inpCredentials = this.loginStateCredentials;
    if (this.isForcedLogout) {
      console.log("Login.vue/mounted() : was forced Logout");

      this.$notify({
        group: "error",
        title: "Error",
        text:
          "Sorry, you have been logged out from this session since another user has logged in. Please contact the administrator if this was in error"
      });
    } else {
      console.log("Login.vue/mounted() : was not forced Logout");
    }
  },
  props: {},

  data() {
    return {
      isLoginDisabled: false,
      inpCredentials: {
        userId: "",
        station: "",
        password: ""
      },

      alertBanner: {
        message: "",
        color: "",
        show: false
      },
      spinner: {
        show: false
      }
    };
  },

  methods: {
    //Test method only. Not used in production.
    checkMasterTab() {
      this.$store
        .dispatch("isThisMasterTab")
        .then(isMasterTab => console.log("checkMasterTab(): ", isMasterTab));
      let state =
        "navState= " +
        localStorage.getItem("navState") +
        "tabState= " +
        localStorage.getItem("tabState");
      this.$notify({
        group: "success",
        title: "Error",
        text: state
      });
    },
    handleEnterKeyForLogin(e) {
      if (e.keyCode === 13) {
        this.performAgentLogin();
      }
    },
    agentLoginBtnClicked() {
      this.$store.dispatch("onAgentLoginBtnClicked", this.inpCredentials);
    },
    performAgentLogin() {
      console.log("agentLoginBtnClicked(): onClick function called");
      //show the loading spinner
      this.showSpinner();

      //generate a subscription ID using the current timestamp and the userId
      let generatedSubscriptionId = Utils.generateSubscriptionId(
        this.inpCredentials.userId
      );

      //create the login request packet using the input values entered by the user
      let loginRequest = {
        userId: this.inpCredentials.userId,
        station: this.inpCredentials.station,
        password: this.inpCredentials.password,
        subscriptionId: generatedSubscriptionId,
        auxCodes: []
      };
      //create the socket request
      let socketLoginRequest = {
        userId: loginRequest.userId,
        subscriptionId: loginRequest.subscriptionId
      };
      console.log(
        "Socket event about to send for socketLogin(): ",
        socketLoginRequest
      );
      try {
        this.$socket.emit("LOGIN", socketLoginRequest, response => {
          console.log("Socket event sent for socketLogin(): ack=", response);

          IcwsConnector.agentLoginRequest(loginRequest)
            .then(resp => {
              console.log(
                "agentLoginBtnClicked(): response received: resp=",
                resp
              );

              if (resp.responseCode === 0) {
                loginRequest.auxCodes = resp.statusMessages;
                let sessionParams = {
                  sessionId: resp.sessionId,
                  csrfToken: resp.csrfToken,
                  cookie: resp.cookie[0],
                  subscriptionId: resp.subscriptionId
                };

                console.log("agentLoginBtnClicked() Login Successful", resp);

                console.log(
                  "agentLoginBtnClicked() sessionParams=",
                  sessionParams
                );

                let loginPacket = {
                  loginRequest: loginRequest,
                  sessionParams: sessionParams
                };
                this.$store.dispatch("processAgentLogin", loginPacket);

                let dialerLoginRequestPacket = sessionParams;
                dialerLoginRequestPacket.userId = loginRequest.userId;
                dialerLoginRequestPacket.campaignId = "";
                this.$store
                  .dispatch("dialerLoginRequest", dialerLoginRequestPacket)
                  .then(() => {
                    this.$store.dispatch(
                      "icws_updateAgentStatusMessage",
                      "Available"
                    );
                  });
              } else {
                console.log("agentLoginBtnClicked(): resp not 0. resp=", resp);
                this.showAlert("danger");

                this.$notify({
                  group: "error",
                  title: "Error",
                  text:
                    "Agent Login failed:" + JSON.stringify(resp.body.message)
                });
              }
            })
            .catch(error => {
              console.log(
                "agentLoginBtnClicked(): response failed: error=",
                error
              );
            })
            .finally(() => {
              this.hideSpinner();
            });
        });
      } catch (err) {
        console.error(err.message);
      }
    },
    // dialerLogin(request) {
    //   IcwsConnector.dialerLoginRequest(request)
    //     .then(resp => {
    //       if (resp.responseCode === 0) {
    //         console.log("dialerLogin(): successful. resp=", resp);
    //         //this.$store.dispatch("dialerLoginSuccessful");
    //         this.$store.dispatch("icws_updateAgentStatusMessage", "Available");
    //       } else {
    //         console.log("dialerLogin(): failed. resp=", resp);
    //         this.$notify({
    //           group: "error",
    //           title: "CAMPAIGN NOT LOGGED IN!",
    //           text:
    //             "The Auto-Dialer Campaign may not have started yet. You will be logged in automatically once the campaign starts"
    //         });
    //       }
    //     })
    //     .catch(error => {
    //       console.log("dialerLogin(): failed. error=", error);
    //     })
    //     .finally();
    // },
    hideAlert() {
      this.alertBanner.message = "";
      this.alertBanner.color = "";
      this.alertBanner.show = false;
    },
    showAlert(color, message) {
      this.alertBanner.message = message;
      this.alertBanner.color = color;
      this.alertBanner.show = true;
    },
    showSpinner() {
      this.spinner.show = true;
    },
    hideSpinner() {
      this.spinner.show = false;
    }
  },
  computed: {
    loginStateCredentials() {
      return this.$store.getters.agentCredentials;
    },
    isForcedLogout() {
      return this.$store.state.app.isForcedLogout;
    },
    mySession() {
      return this.$store.state.session;
    },
    credentials() {
      return this.$store.state.agent;
    },
    socketRequest() {
      return this.$store.state.socketRequest;
    }
  },
  watch: {
    loginStateCredentials(newState) {
      console.log(
        "loginStateCredentials() watch value changed: newState=",
        newState
      );
      if (Utils.validateJson(newState)) {
        console.log("loginStateCredentials() newState is valid");
        this.inpCredentials = newState;

        //switch this to true if you want login to be disabled upon fetching sf details. Has a glitch that needs to be fixed
        this.isLoginDisabled = false;
      } else {
        console.log("loginStateCredentials() newState is invalid");
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* .fl_corner_bg {
} */
.fl_login_banner {
  background: rgba(204, 0, 0, 1);
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
    GradientType=1 );
}
.login-radio-container {
  align-content: center;
  justify-content: space-around;
  display: flex;
  width: 50%;
  margin: auto;
  padding-bottom: 10px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.iconCallHangup {
  transform: rotate(135deg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
