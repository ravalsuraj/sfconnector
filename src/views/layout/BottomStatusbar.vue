<template>
  <footer class="page-footer font-small special-color p-2" style="height:25px">
    <span class="float-left grey-text">{{subscriptionId}}</span>
    <span class="float-right grey-text">{{agentDetails}}</span>
  </footer>
</template>

<script>
export default {
  name: "TopNavbar",
  components: {},
  computed: {
    subscriptionId() {
      let subId = this.$store.state.session.subscriptionId;
      if (subId && subId !== "") {
        return "sub: " + subId;
      } else {
        return "";
      }
    },
    agentDetails() {
      let tabId = this.$store.state.tab.id;
      let stnId = this.$store.state.agent.station;

      let tabDisp = " ";
      let stnDisp = " ";
      if (tabId && tabId !== "") {
        tabDisp = "win: " + tabId + " ";
      }
      if (stnId && stnId !== "") {
        stnDisp = "stn: " + stnId + " ";
      }

      return stnDisp + "  " + tabDisp;
    }
  }
};
</script>