<template>
  <mdb-container class="form form-inline d-flex align-items-center px-2">
    <mdb-dropdown class="mr-2" :disabled="isStatusLocked">
      <a class="dropdown-toggle-a primary-text" slot="toggle">
        <mdb-icon
          icon="circle"
          :class="getAgentStateColorByGroupTag(activeAgentStatusMessage.groupTag)"
          class="mr-1 fl_notification_bulb"
        />
        {{activeAgentStatusMessage.messageText}}
      </a>
      <transition name="fade" mode="out-in">
      
        <mdb-dropdown-menu left class="fl_scrolling-dropdown">
          <mdb-dropdown-item
            class="p-0 fl_dropdown_item"
            v-for="(status) in selectableStatusMessages"
            :key="status.id"
          >
            <div @click="agentStateChangeClicked(status.statusId)" class="p-2">
              <mdb-icon
                icon="circle"
                class="mr-1"
                :class="getAgentStateColorByGroupTag(status.groupTag)"
              />
              <span>{{status.messageText}}</span>
            </div>
          </mdb-dropdown-item>
        </mdb-dropdown-menu>
      </transition>
    </mdb-dropdown>
   
  </mdb-container>
</template>

<script>
import IcwsConnector from "@/services/icwsConnector.js";
import {DIALER_STATES} from '@/defines.js';
import {
  mdbContainer,
  mdbDropdown,
  mdbDropdownItem,
  mdbDropdownMenu,
  mdbIcon
} from "mdbvue";
export default {
  name: "AgentStateDropdown",
  components: {
    mdbContainer,
    mdbIcon,
    mdbDropdown,
    mdbDropdownItem,
    mdbDropdownMenu
  },
  props: {},
  data() {
    return {};
  },
  methods: {
    //TODO: retreive group tags from config file
    getAgentStateColorByGroupTag(groupTag) {
      switch (groupTag) {
        case "AVAILABLE":
          return "green-text";
        case "ON_CALL":
        case "AWAITING_CALLBACK":
          return "amber-text";
        case "ACW":
          return "light-blue-text";
        case "BREAK":
        case "UNAVAILABLE":
        default:
          return "red-text";
      }
    },
    getAgentStateColor(state) {
      let color = "red-text";
      if (state && state !== undefined && state !== "") {
        if (state.includes("Available")) {
          color = "green-text";
        }
      }
      return color;
    },

    //This Method is called whenever the Agent Dropdown option is changed
    agentStateChangeClicked(statusMessage) {
      let updateStateRequest = this.updateStateSessionParams;
      updateStateRequest.body.statusId = statusMessage;
      IcwsConnector.agentStateChangeRequest(updateStateRequest)
        .then(resp => {
          console.log(
            "agentStateChangeRequestClicked(): response received: ",
            resp
          );

          //resp.responseCode is correct
          if (resp.responseCode === 0) {
            console.log(
              "agentStateChangeRequestClicked() agentStateChangeRequest Successful",
              resp
            );
            //this.$store.commit("agentStateChangeRequest", statusMessage);
          } else {
            console.log(
              "agentStateChangeRequestClicked() agentStateChangeRequest Failed",
              resp
            );
          }
        })
        .catch(error => {
          console.log(
            "agentStateChangeRequestClicked(): response failed: " +
              JSON.stringify(error)
          );
        })
        .finally(() => {});
    }
  },
  computed: {
    
    updateStateSessionParams() {
      return {
        header: this.$store.getters.sessionParams,
        body: {
          userId: this.$store.state.agent.userId
        }
      };
    },
    activeAgentState() {
      return !this.$store.state.agent.status !== undefined
        ? this.$store.state.agent.status
        : "Not Set";
    },
    activeAgentStatusMessage() {
      let activeStatusId = this.$store.state.agent.status;
      let defaultStatusMessage = {
        messageText: "Not Set",
        statusId: "Not Set",
        groupTag: "UNAVAILABLE"
      };
      let ssm = this.allStatusMessages;
      let i;
      for (i = 0; i < ssm.length; i++) {
        if (activeStatusId === ssm[i].statusId) {
          return ssm[i];
        }
      }
      return defaultStatusMessage;
    },
    statusMessages() {
      return this.$store.state.agent.auxCodes;
    },
    isStatusLocked() {
      return this.$store.state.agent.isStatusLocked;
    },

    selectableStatusMessages() {
      return this.$store.getters.selectableStatusMessages;
    },
    allStatusMessages() {
      return this.$store.getters.allStatusMessages;
    }
  },
  watch: {
    statusMessages(newStatus) {
      if (["Awaiting Callback", "ACW_ORL"].indexOf(newStatus) >= 0) {
        //this.$store.dispatch("lockAgentStatus");
      } else {
        // this.$store.dispatch("unlockAgentStatus");
      }
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
.fl_scrolling-dropdown {
  height: 150px;
  overflow-y: scroll;
}

.fl_dropdown_item {
  font-size: 1rem !important;
}
.drop .dropdown-toggle-a {
  background-color: none;
}
.dropdown-toggle-a:after {
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: "";
  border-top: 0.3em solid;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}
.custom-select {
  height: unset !important;
  line-height: 1;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
