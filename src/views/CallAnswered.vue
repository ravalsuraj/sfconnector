<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div v-if="isInboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Inbound Call Answered</h4>
      <h4 class>{{sfRecord.callerName}}</h4>
    </div>

    <div v-if="isCampaignCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Campaign Call Connected</h4>
      <h4 class>{{sfRecord.callerName}}</h4>
    </div>

    <div v-if="isOutboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Outbound Call Answered</h4>
      <h4 class>{{clickToDialRequest.recordName}}</h4>
    </div>
    <mdb-col col="8">
      <mdb-btn
        class="danger-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('disconnect')"
      >Disconnect</mdb-btn>
      <mdb-btn
        class="special-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('hold')"
      >Hold</mdb-btn>
      <mdb-btn
        class="mdb-color btn-block mb-3"
        size="sm"
        @click="sendTelephonyControlRequest('unhold')"
      >Unhold</mdb-btn>
      <hr />
      <mdb-btn class="mdb-color btn-block mb-3" size="sm" @click="forceScreenPop()">Manual Screenpop</mdb-btn>
    </mdb-col>
    <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert>
  </div>
</template>

<script>
import {
  mdbContainer,
  mdbRow,
  mdbCol,
  mdbBtn,
  mdbCard,
  mdbCardBody,
  mdbCardHeader,
  mdbCardText,
  mdbInput,
  mdbIcon,
  mdbAlert
} from "mdbvue";

import {
  AGENT_STATES,
  CALL_STATES,
  CALL_DIRECTION,
  CALL_PURPOSE
} from "@/defines.js";

import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "CallAnswered",
  components: {
    mdbContainer,
    mdbRow,
    mdbCol,
    mdbBtn,
    mdbCard,
    mdbCardBody,
    mdbCardHeader,
    mdbCardText,
    mdbInput,
    mdbIcon,
    mdbAlert
  },

  data() {
    return {
      showAgentNotReadyError: false,
      showWidget: true,

      loginAlert: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  methods: {
    forceScreenPop() {
      this.$store.commit("resetScreenpopFlag");
      this.$store.dispatch("sf_ctiLeadLookup").then(() => {
        this.$store.dispatch("sf_screenPopLead", this.leadIdToScreenpop);
      });

      // if (this.leadIdToScreenpop && this.leadIdToScreenpop !== "") {

      // } else {
      //   this.$store.dispatch("sf_ctiLeadLookup");
      //   this.showAlert(
      //     "danger",
      //     "Lead ID not found, please wait while we fetch lead Details"
      //   );
      // }
    },

    sendTelephonyControlRequest(controlType) {
      this.icwsControlRequestParams.controlType = controlType;
      IcwsConnector.callControlRequest(this.icwsControlRequestParams)
        .then(resp => {
          console.log(
            "sendTelephonyControlRequest(): response successful. resp.data=",
            resp.data
          );

          if (resp.data.responseCode === 0) {
            console.log("sendTelephonyControlRequest(): response code is 0");

            console.log("sendTelephonyControlRequest() Successful", resp);
          } else {
            console.log("sendTelephonyControlRequest() Failed", resp);
            this.ShowAlert("danger", JSON.stringify(resp));
          }
        })
        .catch(error => {
          console.log(
            "sendTelephonyControlRequest(): response failed: ",
            error
          );
        })
        .finally(() => {});
    },

    hideAlert() {
      this.loginAlert.message = "";
      this.loginAlert.color = "";
      this.loginAlert.show = false;
    },
    showAlert(color, message) {
      this.loginAlert.message = message;
      this.loginAlert.color = color;
      this.loginAlert.show = true;
    }
  },
  computed: {
    leadIdToScreenpop() {
      return this.$store.state.sfRecord.leadId;
    },
    icwsControlRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        interactionId: this.$store.state.call.interactionId,
        subscriptionId: this.$store.state.session.subscriptionId
      };
    },

    callDirection() {
      return this.$store.state.call.direction;
    },
    isInboundCall() {
      return this.callDirection === CALL_DIRECTION.INBOUND;
    },
    isOutboundCall() {
      return (
        this.callDirection === CALL_DIRECTION.OUTBOUND &&
        this.$store.state.call.purpose !== CALL_PURPOSE.DIALER
      );
    },

    isCampaignCall() {
      return (
        this.callDirection === CALL_DIRECTION.OUTBOUND &&
        this.$store.state.call.purpose === CALL_PURPOSE.DIALER
      );
    },
    clickToDialRequest() {
      return this.$store.state.clickToDialRequest;
    },
    sfRecord() {
      return this.$store.state.sfRecord;
    }
  }
};
</script>