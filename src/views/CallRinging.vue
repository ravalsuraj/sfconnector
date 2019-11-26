<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div v-if="isInboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold green-text">Inbound Call Ringing</h4>
      <h4>{{sfRecord.recordName}}</h4>

      <mdb-btn
        v-if="isInboundCall || isCampaignCall"
        class="success-color"
        @click="sendTelephonyControlRequest('answer')"
      >Answer</mdb-btn>
    </div>
    <div v-if="isOutboundCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Outbound Call Dialing</h4>
      <h4>{{clickToDialRequest.recordName}}</h4>
      <mdb-btn class="danger-color" @click="sendTelephonyControlRequest('disconnect')">Cancel</mdb-btn>
    </div>

    <div v-if="isCampaignCall" class="d-flex flex-column align-items-center">
      <h4 class="font-weight-bold light-blue-text">Campaign Call Ringing</h4>
      <h4>{{sfRecord.recordName}}</h4>
            <mdb-btn
        v-if="isInboundCall || isCampaignCall"
        class="success-color"
        @click="sendTelephonyControlRequest('answer')"
      >Answer</mdb-btn>
    </div>

    <mdb-alert :color="loginAlert.color" v-if="loginAlert.show">{{loginAlert.message}}</mdb-alert>
  </div>
</template>

<script>
import { mdbBtn, mdbAlert } from "mdbvue";
import { CALL_DIRECTION, CALL_PURPOSE } from "@/defines.js";
import IcwsConnector from "@/services/icwsConnector.js";
export default {
  name: "CallRinging",
  components: { mdbBtn, mdbAlert },
  mounted() {
    this.showSoftphone();
    if (this.isInboundCall || this.isCampaignCall) {
      // this.sendTelephonyControlRequest("answer");
    } else if (this.isOutboundCall) {
      console.log("CallRinging mounted for OutboundCall");
    }
  },
  props: {},

  data() {
    return {
      loginAlert: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  methods: {
    showSoftphone() {
      // eslint-disable-next-line no-undef
      sforce.opencti.setSoftphonePanelVisibility({
        visible: true,
        callback: callback
      });
      var callback = response => {
        if (response.success) {
          console.log(
            "showSoftphone(): call executed successfully! returnValue:",
            response.returnValue
          );
        } else {
          console.error("showSoftphone(): Errors:", response.errors);
        }
      };
    },
    sendTelephonyControlRequest(controlType) {
      this.icwsControlRequestParams.controlType = controlType;
      console.log(
        " sendTelephonyControlRequest():  sending call control request with request=",
        this.icwsControlRequestParams
      );
      IcwsConnector.callControlRequest(this.icwsControlRequestParams)
        .then(resp => {
          console.log(
            " sendTelephonyControlRequest(): response successful. resp=",
            resp.data
          );

          if (resp.data.responseCode === 0) {
            console.log(" sendTelephonyControlRequest(): response code is 0");
            console.log(" sendTelephonyControlRequest():  Successful", resp);
          } else {
            console.log(" sendTelephonyControlRequest():  Failed", resp);
            this.showAlert("danger", JSON.stringify(resp.body.message));
          }
        })
        .catch(error => {
          console.log(
            " sendTelephonyControlRequest(): response failed: ",
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
    icwsControlRequestParams() {
      return {
        cookie: this.$store.state.session.cookie,
        csrfToken: this.$store.state.session.csrfToken,
        sessionId: this.$store.state.session.sessionId,
        subscriptionId: this.$store.state.session.subscriptionId,
        interactionId: this.$store.state.call.interactionId
      };
    },
    cli() {
      return this.$store.state.call.customerNumber;
    },
    dnis() {
      return this.$store.state.call.virtualNumber;
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
    sfRecord() {
      return this.$store.state.sfRecord;
    },
    clickToDialRequest() {
      return this.$store.state.clickToDialRequest;
    }
  }
};
</script>
