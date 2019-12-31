<template>
  <mdb-container class="pt-3 px-2 clearfix" fluid>
    <mdb-row class="no-gutters">
      <mdb-col col="6">
        <agent-state-dropdown></agent-state-dropdown>
      </mdb-col>

      <mdb-col col="3">
        <persist-timer timerName="agentStateTimer"></persist-timer>
      </mdb-col>

      <mdb-col col="3">
        <logout-button></logout-button>
      </mdb-col>
      <mdb-col col="3" class="px-2">
        <mdb-icon icon="circle" :class="dialerState" class="mr-1 fl_notification_bulb" />
        <span class="pr-1">Dialer</span>
      </mdb-col>
    </mdb-row>
  </mdb-container>

</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";
import PersistTimer from "@/components/PersistTimer.vue";
import {
  mdbIcon,
  mdbContainer,
  mdbRow,
  mdbCol,
  mdbNavbar,
  mdbNavbarBrand,
  mdbNavbarToggler,
  mdbNavbarNav,
  mdbNavItem,
  mdbDropdown,
  mdbDropdownToggle,
  mdbDropdownMenu,
  mdbDropdownItem
} from "mdbvue";

import AgentStateDropdown from "@/components/AgentStateDropdown.vue";
import LogoutButton from "@/components/LogoutButton.vue";
import { DIALER_STATES } from "@/defines.js";
export default {
  name: "TopNavbar",
  components: {
    AgentStateDropdown,
    LogoutButton,
    PersistTimer,
    mdbContainer,
    mdbRow,
    mdbCol,
    mdbIcon,
    mdbNavbar,
    mdbNavbarBrand,
    mdbNavbarToggler,
    mdbNavbarNav,
    mdbNavItem,

    mdbDropdown,
    mdbDropdownToggle,
    mdbDropdownMenu,
    mdbDropdownItem
  },
  methods: {},
  computed: {
    dialerState() {
      let dialerState = this.$store.getters.getDialerState;
      let dialerStateColor = "grey-text";
      switch (dialerState) {
        case DIALER_STATES.LOGGED_OUT:
          dialerStateColor = "red-text";
          break;
        case DIALER_STATES.DIALER_LOGGED_IN:
          dialerStateColor = "cyan-text";
          break;
        case DIALER_STATES.CAMPAIGN_LOGGED_IN:
          dialerStateColor = "green-text";
          break;
      }
      return dialerStateColor;
    }
  }
};
</script>

<style scoped>
.fl_notification_bulb {
  border: rgba(0, 0, 0, 0.25) 1px solid;
  border-radius: 50%;
  box-shadow: inset 0px 1px 3px 5px rgba(0, 0, 0, 0.75);
}
</style>

