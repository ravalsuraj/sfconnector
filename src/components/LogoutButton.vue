<template>
  <mdb-btn color="danger" size="sm" @click="agentLogoutBtnClicked" class="mt-0">Log out</mdb-btn>
  <!-- <a  class="mt-0">Log out</a> -->
  <!-- <a @click="agentLogoutBtnClicked" class="stretched-link">Go somewhere</a> -->
</template>

<script>
import { mdbBtn } from "mdbvue";
import { AGENT_STATES } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "LogoutButton",
  components: {
    mdbBtn
  },
  mounted() {},
  props: {},

  data() {
    return {};
  },

  methods: {
    agentLogoutBtnClicked() {
      let socketLogoutRequest = {
        userId: this.logoutRequestParams.userId,
        subscriptionId: this.logoutRequestParams.subscriptionId
      };
      console.log("agentLogoutBtnClicked(): event received");
      if (this.agentAcdState === AGENT_STATES.LOG_IN) {
        //Since agent is logged in, first logout the dialer and only then logout the agent in ACD
        IcwsConnector.dialerLogoutRequest(this.logoutRequestParams)
          .then(resp => {
            console.log(
              "dialerLogoutRequest(): response successful. resp=",
              resp
            );

            //resp.responseCode is correct
            if (resp.responseCode === 0) {
              console.log("dialerLogoutRequest(): response code is 0");

              console.log("dialerLogoutRequest(): Logout Successful", resp);
            } else {
              console.log("dialerLogoutRequest(): Logout Failed", resp);
              if (resp.responseCode === 401 || resp.body.errorCode === 7) {
                this.$store.dispatch("processAgentLogout");
              }
            }
          })
          .catch(error => {
            console.log("dialerLogoutRequest(): response failed: ", error);
          })
          .finally(() => {
            IcwsConnector.agentLogoutRequest(this.logoutRequestParams)
              .then(resp => {
                console.log(
                  "agentLogoutBtnClicked(): response successful. resp=",
                  resp
                );

                //resp.responseCode is correct
                if (resp.responseCode === 0) {
                  console.log("agentLogoutBtnClicked(): response code is 0");

                  console.log(
                    "agentLogoutBtnClicked(): sending socket event for logout. socketLogoutRequest=",
                    socketLogoutRequest
                  );
                  try {
                    this.$socket.emit(
                      "LOGOUT",
                      socketLogoutRequest,
                      response => {
                        console.log(
                          "agentLogoutBtnClicked(): Socket event sent for socketLogout(): ack=",
                          response
                        );
                      }
                    );
                  } catch (err) {
                    console.error(err.message);
                  }

                  console.log(
                    "agentLogoutBtnClicked(): Logout Successful",
                    resp
                  );
                } else {
                  console.log("agentLogoutBtnClicked(): Logout Failed", resp);
                  if (resp.responseCode === 401 || resp.body.errorCode === 7) {
                  }
                }
              })
              .catch(error => {
                console.log(
                  "agentLogoutBtnClicked(): response failed: ",
                  error
                );
              })
              .finally(() => {
                this.$store.dispatch("processAgentLogout");
              });
          });
      }
    }
  },
  computed: {
    logoutRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        userId: this.$store.state.agent.userId
      };
    },
    agentAcdState() {
      return this.$store.state.agent.acdState;
    },
    agentDialerState() {
      return this.$store.state.agent.dialerState;
    },
    agentStatus() {
      return this.$store.getters.agentStatus;
    }
  }
};
</script>

