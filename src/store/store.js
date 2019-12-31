/* eslint-disable no-unused-vars */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
import VuexPersist from 'vuex-persist'
import createMutationsSharer from 'vuex-shared-mutations'

import {
  APP_STATES,
  AGENT_STATES,
  DIALER_STATES,
  TIMER_STATES,
  CALL_STATES,
  CALL_DIRECTION,
  CALL_PURPOSE
} from '@/defines.js'

import { CONFIG } from '@/config.js'

import parsePhone from "@/services/phoneParser.js";
import IcwsConnector from "@/services/icwsConnector.js";
import Utils from "@/services/utils.js";
import TabManager from "@/services/TabManager.js"


const vuexPersist = new VuexPersist({
  key: 'sf-cti-connector',
  storage: localStorage,

  reducer: (state) => (
    {
      app: state.app,
      session: state.session,
      agent: state.agent,
      call: state.call, sfRecord: state.sfRecord,
      clickToDialRequest: state.clickToDialRequest,
      callDisposition: state.callDisposition,
      timer: state.timer,
      timerControl: state.timerControl,
      timers: state.timers,
      timerList: state.timerList,
      statusMessages: state.statusMessages
    }
  ),
})

// const vuexSessionStorage = new VuexPersist({
//   key: 'sf-cti-connector-session',
//   storage: sessionStorage,
//   reducer: (state) => (
//     {

//     }
//   ),
// })

function initialState() {
  return {
    timers: [
    ],
    timerList: [],
    app: {
      state: APP_STATES.LOGGED_OUT,
      previousState: APP_STATES.LOGGED_OUT,
      isForcedLogout: false,
      isScreenPopDone: false,
    },
    session: {
      sessionId: null,
      csrfToken: null,
      cookie: null,
      subscriptionId: null
    },
    agent: {
      salesforceUserIdForAgent: '',
      userId: '',
      station: '',
      password: '',

      status: '',
      acdState: '',
      dialerState: '',

      isStatusLocked: false,
      auxCodes: [],
      dialerCampaignId: null
    },
    call: {
      state: CALL_STATES.IDLE,
      interactionId: null,
      purpose: null,
      direction: null,
      customerNumber: null,
      customerCountryCode: null,
      virtualNumber: null,
      callStartDateTime: null,
      callEndDateTime: null,
      callDuration: null,
      recordingId: null,
      recordingURL: null,
      comments: null,
      callTerminationType: null
    },
    sfRecord: {
      campaignId: null,
      leadId: null,
      siteId: null,
      siteName: null,
      projectName: null,
      projectId: null,

      callerName: null,
      wasLeadIdNull: 'yes',

    },
    dialerDisposition: {
      wrapupCode: 'success'
    },
    clickToDialRequest: {
      number: null,
      recordId: null,
      recordName: null,
      objectType: null,
    },

    callDisposition: {
      sfCallId: '',
      sessionId: '',
      calledNumber: '',
      callingCountrycode: '',
      callingNumber: '',
      leadId: '',
      contactId: '',
      opportunityId: '',
      projectId: '',
      tower: '',
      property: '',
      booking: '',
      broker: '',
      campaign: '',
      site: '',
      wasLeadIdNull: '',
      callStartDateTime: '',
      callEndDateTime: '',
      callDuration: '',
      comments: '',
      callTeam: '',
      callType: '',
      callStatus: '',
      agent: '',
      recordingURL: ''
    },
    timer: {
      control: TIMER_STATES.CONTROL.STOP,
      state: TIMER_STATES.EVENTS.STOPPED,
      targetSeconds: 90,
      refTime: null,
      currentTime: null,
      interval: null,
      clockTime: null
    },
    timerControl: {
      acwTimer: {
        control: TIMER_STATES.CONTROL.STOP,
        state: TIMER_STATES.EVENTS.STOPPED,
        expiry: 90,
        ticks: 0
      }
    },
    statusMessages: null,
    tab: {
      id: null,
      focus: false
    }
  }
}


export default new Vuex.Store({
  strict: false, //imporntat: this is set to false to comply with Vuex-persist
  plugins: [vuexPersist.plugin, createMutationsSharer({
    predicate: [
      'setAutoDisposedCallId',
      'setSfRecordForExistingLeadCaller',
      'setSfRecordForNewLeadCaller',
      'setSfRecordForMultipleLeadCaller',
      'setClickToDialSfRecord',
      'setCallCustomerNumber',
      'setCallCountryCode',
      'setCallVirtualNumber',
      'setCallrecordingURL',
      'updateAgentStatus'
    ]
  })],
  state: initialState,

  sockets: {
    connect() {
      console.log("socket connected");
      this.$store.commit("socketConnected");
    },
    connect_error() {
      console.log("Connection Error for WebSocket");
      this.$store.commit("socketDisconnected");
    },
    connection_error() {
      console.log("Connection Timeout for WebSocket");
      this.$store.commit("socketDisconnected");
    }
  },
  getters: {

    tabId(state) {
      console.log("getting tabId=", state.tab.id)
      return state.tab.id
    },

    // finalClockTime(state) {
    //   let refTime = state.timer.refTime;
    //   let currentTime = state.timer.currentTime;
    //   let timeDifference = refTime - currentTime
    //   var min = Math.floor((timeDifference / 1000 / 60) % 60);
    //   let minutes = (min >= 10 ? min : "0" + min);
    //   var sec = Math.ceil((timeDifference / 1000) % 60);
    //   let seconds = sec >= 10 ? sec : "0" + sec;

    //   return minutes + ":" + seconds;
    // },
    getClockTime(state) {
      return state.timer.clockTime

    },


    acwTimerTicks(state) {
      return state.timerControl.acwTimer.ticks
    },
    /*****************getters - Clock Timer **************************** */
    getTimerState(state) {
      return state.timer.state
    },
    getTimerControl(state) {
      console.log("called getTimerControl")
      return state.timer.control
    },

    getRefTime(state) {
      return state.timer.refTime;
    },
    getCurrentTime(state) {
      return state.timer.currentTime;
    },
    getTargetSeconds(state) {
      return state.timer.targetSeconds * 1000
    },
    getInterval(state) {
      return state.timer.interval
    },

    /*************Getters for timer************** */
    getTimers(state) {
      return state.timers;
    },
    getTimer: (state) => (timerName) => {
      let index = state.timerList.indexOf(timerName)
      return state.timers[index]
    },
    getTimerIndex: (state) => (timerName) => {
      return state.timerList.indexOf(timerName)
    },
    getTimerStatus: (state) => (timerName) => {
      console.log("getters.getTimerStatus=" + state[timerName].status)
      return state[timerName].status
    },

    getTimerExpiry: (state) => (timerName) => {
      console.log("getTimerExpiry, timerName=", timerName)
      return state[timerName].expiry
    },
    /********************* getters: app  **************************/

    appState(state) {
      return state.app.state
    },

    isScreenPopDone(state) {
      return state.app.isScreenPopDone
    },

    /********************* getters: agent  **************************/
    userId(state) {
      return state.agent.userId
    },

    agentCredentials: state => {
      return {
        userId: state.agent.userId,
        station: state.agent.station,
        password: state.agent.password
      }
    },

    getDialerState(state) {
      return state.agent.dialerState
    },

    statusMessages(state) {
      return state.statusMessages
    },

    allStatusMessages(state) {
      if (state.statusMessages) {
        return state.statusMessages;
      } else {
        return []
      }
    },

    selectableStatusMessages(state) {
      let sm = state.statusMessages
      let ssm = []
      let i
      if (sm) {

        for (i = 0; i < sm.length; i++) {
          if (sm[i].isSelectableStatus && CONFIG.SYS_STATUS_GROUPS.indexOf(sm[i].groupTag) < 0) {
            ssm.push({
              statusId: sm[i].statusId,
              messageText: sm[i].messageText,
              groupTag: sm[i].groupTag,
            })
          }
        }
        return ssm
      } else {
        return []
      }
    },

    getDialerCampaignId(state) {
      return state.agent.dialerCampaignId
    },

    /********************* getters: session **************************/
    sessionParams(state) {
      return {
        cookie: state.session.cookie,
        csrfToken: state.session.csrfToken,
        sessionId: state.session.sessionId,
        subscriptionId: state.session.subscriptionId
      }
    },

    socketRequestParams(state) {
      return {
        userId: state.agent.userId,
        subscriptionId: state.session.subscriptionId
      }
    },
    clientLogRequestParams(state) {
      return {
        subscriptionId: state.session.subscriptionId,
        interactionId: state.call.interactionId,
        message: ''
      }
    },
    /********************* getters: call disposition**************************/
    callDisposition(state) {
      return state.callDisposition
    },

    getDialerDispositionWrapupCode(state) {
      return state.dialerDisposition.wrapupCode
    },

    /********************* getters: click-to-dial **************************/

    clickToDialRequest(state) {
      return state.clickToDialRequest;
    },


    /********************* getters: salesforce **************************/
    sfRecord(state) {
      return state.sfRecord
    },
    sfUserId(state) {
      return state.agent.salesforceUserIdForAgent;
    },

    /********************* getters: call **************************/
    interactionId(state) {
      return state.call.interactionId
    },

    countryCode(state) {
      return state.call.customerCountryCode;
    },
    customerNumber(state) {
      return state.call.customerNumber;
    },

    virtualNumber(state) {
      return state.call.virtualNumber;
    },

    getCallStartTime(state) {
      return state.call.callStartDateTime
    },

    getCallEndTime(state) {
      return state.call.callEndDateTime
    },

    callDirection(state) {
      return state.call.direction;
    },

    callRecordingId(state) {
      return state.call.recordingId
    },

    getCallTerminationType(state) {
      return state.call.callTerminationType
    },

    isInboundCall(state) {
      return (state.call.direction === CALL_DIRECTION.INBOUND)
    },
    isOutboundCall(state) {
      return (
        state.call.direction === CALL_DIRECTION.OUTBOUND &&
        state.call.purpose !== CALL_PURPOSE.DIALER
      );
    },

    isCampaignCall(state) {
      return (
        state.call.direction === CALL_DIRECTION.OUTBOUND &&
        state.call.purpose === CALL_PURPOSE.DIALER
      );
    },

  },

  mutations: {
    setTabId(state, payload) {
      console.log("about to commit: payload=", payload)
      state.tab.id = payload
      console.log("state.tab.id=", state.tab.id)
    },
    setTabFocus(state, payload) {
      state.tab.focus = payload
    },
    /********************* mutations: app **************************/



    screenPopDone(state) {
      state.app.isScreenPopDone = true
    },

    resetCallProcesses(state) {
      state.app.isScreenPopDone = false
    },

    resetVuexState(state) {
      const s = initialState()
      Object.keys(s).forEach(key => {
        if (key !== "tab") {
          state[key] = s[key]
        }

      })
    },

    setForcedLogoutFlag(state, payload) {
      state.app.isForcedLogout = payload
    },

    /********************* mutations: session **************************/
    setSessionParams(state, payload) {
      console.log("setSessionParams paylod=", payload)
      state.session.sessionId = payload.sessionId
      state.session.csrfToken = payload.csrfToken
      state.session.cookie = payload.cookie
      state.session.subscriptionId = payload.subscriptionId
    },
    resetSessionParams(state) {
      state.session.sessionId = null
      state.session.csrfToken = ''
      state.session.cookie = null
      state.session.subscriptionId = ''

    },

    /********************* mutations: socket **************************/
    connectionError(state) {
      if (state.app.state !== APP_STATES.CONNECTION_ERROR) {
        state.app.previousState = state.app.state
        state.app.state = APP_STATES.CONNECTION_ERROR
      }
    },
    connectionRestored(state) {
      if (state.app.state === APP_STATES.CONNECTION_ERROR) {
        state.app.state = state.app.previousState
      }
    },

    /********************* mutations: agent **************************/
    setAgentLoginState(state, payload) {
      state.app.state = APP_STATES.LOGGED_IN
      state.agent.acdState = AGENT_STATES.LOG_IN

      state.agent.userId = payload.userId
      state.agent.station = payload.station
      state.agent.auxCodes = payload.auxCodes
    },

    setAgentStateLogout(state) {
      state.agent.acdState = AGENT_STATES.LOG_OUT
      state.app.state = APP_STATES.LOGGED_OUT
      state.agent.auxCodes = []
    },

    setDialerState(state, payload) {
      state.agent.dialerState = payload
    },
    setAgentAcdState(state, payload) {
      state.agent.acdState = payload
    },

    updateAgentStatus(state, payload) {
      state.agent.status = payload
    },
    setStatusMessages(state, payload) {
      state.statusMessages = payload
    },
    setSalesforceAgentDetails(state, payload) {
      console.log("setSalesforceAgentDetails() entered mutation: payload=", payload)
      state.agent.salesforceUserIdForAgent = payload.Id
      if (state.app.state === APP_STATES.LOGGED_OUT) {
        state.agent.userId = payload.CTI_Agent_ID__c
        state.agent.station = payload.CTI_Extension__c
        state.agent.password = payload.CTI_Password__c
      }
    },

    setDialerCampaignId(state, payload) {
      state.agent.dialerCampaignId = payload
    },

    /********************* mutations: salesforce **************************/
    setLeadId(state, payload) {
      state.sfRecord.leadId = payload
      state.sfRecord.wasLeadIdNull = "no"
    },

    setSfRecordForNewLeadCaller(state, payload) {
      state.sfRecord.campaignId = payload.campaignId
      state.sfRecord.wasLeadIdNull = 'yes'
      state.sfRecord.leadId = payload.Id
    },

    setSfRecordForExistingLeadCaller(state, payload) {
      state.sfRecord = payload.leads[0]
      state.sfRecord.campaignId = payload.campaignId
      state.sfRecord.wasLeadIdNull = 'no'
    },

    setSfRecordForMultipleLeadCaller(state, payload) {
      console.log("setSfRecordForMultipleLeadCaller(): payload=" + JSON.stringify(payload))
      state.sfRecord = payload.lead
      state.sfRecord.campaignId = payload.campaignId
      state.sfRecord.wasLeadIdNull = 'no'
    },

    /********************* mutations: click-to-dial **************************/
    setCallStateClickToDial(state, payload) {
      state.call.state = CALL_STATES.DIALING
      state.call.direction = CALL_DIRECTION.OUTBOUND
      state.app.state = APP_STATES.CALL_DIALING
    },

    setClickToDialSfRecord(state, payload) {
      state.clickToDialRequest = payload
      if (payload.objectType === "Lead") {
        state.sfRecord.leadId = payload.recordId
      }
      console.log("setClickToDialSfRecord() commited packet. clickToDialRequest=", state.clickToDialRequest)
    },

    /********************* mutations: call disposition **************************/

    SET_DIALER_DISPOSITION_CODE(state, payload) {
      state.dialerDisposition.wrapupCode = payload
    },
    setAutoDisposedCallId(state, payload) {
      state.callDisposition.sfCallId = payload
    },



    setCallDisposition(state) {
      console.log("setCallDisposition() entering pack call disposition")
      state.callDisposition.sessionId = state.call.interactionId
      state.callDisposition.calledNumber = state.call.virtualNumber
      state.callDisposition.callingCountrycode = state.call.customerCountryCode
      state.callDisposition.callingNumber = state.call.customerNumber
      state.callDisposition.leadId = state.sfRecord.leadId
      state.callDisposition.contactId = null
      state.callDisposition.opportunityId = null
      state.callDisposition.projectId = (state.sfRecord.projectId === "null" ? null : state.sfRecord.projectId)
      state.callDisposition.tower = null
      state.callDisposition.property = null
      state.callDisposition.booking = null
      state.callDisposition.broker = null
      state.callDisposition.campaign = null
      state.callDisposition.site = (state.sfRecord.siteId === "null" ? null : state.sfRecord.siteId)
      state.callDisposition.wasLeadIdNull = state.sfRecord.wasLeadIdNull
      state.callDisposition.callStartDateTime = state.call.callStartDateTime
      state.callDisposition.callEndDateTime = state.call.callEndDateTime
      state.callDisposition.callDuration = state.call.callDuration
      state.callDisposition.callTeam = 'PMT'
      state.callDisposition.callType = state.call.direction
      state.callDisposition.callStatus = (state.call.callTerminationType ? state.call.callTerminationType : '')
      state.callDisposition.agent = state.agent.salesforceUserIdForAgent
      state.callDisposition.recordingURL = state.call.recordingURL
    },

    /********************* mutations: call  **************************/
    setCallStartTime(state, payload) {
      state.call.callStartDateTime = payload.toString()
    },
    setCallEndTime(state, payload) {
      state.call.callEndDateTime = payload.toString()
      state.call.callDuration = ((state.call.callEndDateTime - state.call.callStartDateTime) / 1000).toFixed(2);
    },

    setCallVirtualNumber(state, payload) {
      state.call.virtualNumber = payload
    },

    setCallCustomerNumber(state, payload) {
      state.call.customerNumber = payload
    },

    setCallCountryCode(state, payload) {
      state.call.customerCountryCode = payload;
    },

    setCallInteractionId(state, payload) {
      state.call.interactionId = payload
    },
    setCallDirection(state, payload) {
      state.call.direction = payload
    },
    setCallRecordingId(state, payload) {
      state.call.recordingId = payload
    },
    setCallrecordingURL(state, payload) {
      state.call.recordingURL = payload
    },

    setCallPurpose(state, payload) {
      state.call.purpose = payload
    },

    setCallTerminationType(state, payload) {
      state.call.callTerminationType = payload;
    },

    setCallDispositionComments(state, payload) {
      state.call.comments = payload
      state.callDisposition.comments = payload
    },

    setCallStateAlerting(state) {
      state.app.state = APP_STATES.CALL_RINGING
    },

    setCallStateAnswered(state) {
      state.app.state = APP_STATES.CALL_ANSWERED
    },

    setCallStateOffering(state) {
      state.app.state = APP_STATES.CALL_OFFERING
    },
    setCallStateDropped(state) {
      state.app.state = APP_STATES.AFTER_CALL_WORK
      // if (state.app.state === APP_STATES.CALL_ANSWERED) {
      //   state.app.state = APP_STATES.AFTER_CALL_WORK
      //   state.call.callTerminationType = 'Answered'
      // } else {
      //   if (getters.callDirection === CALL_DIRECTION.OUTBOUND) {
      //     state.call.callTerminationType = 'Not Answered'
      //   } else if (getters.callDirection === CALL_DIRECTION.INBOUND) {
      //     state.call.callTerminationType = 'Missed'
      //   }

      //   state.call.callStartDateTime = state.call.callEndDateTime
      //   state.call.comments = "Call Ringing/Dialing before being disconnected"
      //   const duration = 0;
      //   state.call.callDuration = duration.toFixed(2);
      // }
    },


    /********************* mutations: timer **************************/
    startAcwTimer(state) {
      console.log("starting acw Timer")
      state.timerControl.acwTimer.control = TIMER_STATES.CONTROL.START
      state.timerControl.acwTimer.state = TIMER_STATES.EVENTS.STARTED
    },
    stopAcwTimer(state) {
      state.timerControl.acwTimer.state = TIMER_STATES.EVENTS.STOPPED
      state.timerControl.acwTimer.control = TIMER_STATES.CONTROL.STOP
    },
    pauseAcwTimer(state) {
      state.timercontrol.acwTimer.control = TIMER_STATES.CONTROL.PAUSE
      state.timerControl.acwTimer.state = TIMER_STATES.EVENTS.PAUSED
    },

    // setTimerStateExpired(state, payload) {
    //   state.timerControl[payload].state = TIMER_STATES.EVENTS.EXPIRED
    //   state.timerControl[payload].control = TIMER_STATES.CONTROL.STOP
    // },

    incrementTimerTicks(state, payload) {
      state.timerControl[payload].ticks = state.timerControl[payload].ticks + 1
    },
    resetTimerTicks(state, payload) {
      state.timerControl[payload].ticks = 0
    },

    /****************************mutations: Clock Timer********************************************* */
    SET_CURRENT_TIME(state) {
      let currentTime = new Date().getTime()
      if (currentTime > state.timer.refTime) {
        currentTime = state.timer.refTime
      }
      state.timer.currentTime = currentTime;
    },
    RESET_CURRENT_TIME(state) {
      state.timer.currentTime = null;
    },
    SET_CLOCK_TIME(state, payload) {
      state.timer.clockTime = payload
    },
    SET_REF_TIME(state, payload) {
      state.timer.refTime = payload
    },
    RESET_REF_TIME(state) {
      state.timer.refTime = null
    },
    SET_TIMER_STATE(state, payload) {
      state.timer.state = payload
    },
    SET_TIMER_CONTROL(state, payload) {
      state.timer.control = payload
    },
    SET_INTERVAL(state, payload) {
      state.timer.interval = payload
    },



    //Persist Timer Mutations:
    ADD_UP_TIMER(state, timerName) {
      let newTimer = {
        state: TIMER_STATES.STOP,
        direction: "UP",
        refTime: new Date().getTime()
      };
      state.timerList.push(timerName)
      state.timers.push(newTimer)

    },


    ADD_DOWN_TIMER(state, timerName) {
      let newTimer = {
        state: TIMER_STATES.STOP,
        direction: "DOWN",
        refTime: new Date().getTime()
      };
      state.timerList.push(timerName)
      state.timers.push(newTimer)

    },

    REMOVE_TIMER(state, timerName) {
      let index = state.timerList.indexOf(timerName)
      if (index != -1) {
        state.timers.splice(index, 1)
        state.timerList.splice(index, 1)
      }

    },
    SET_START_TIME(state, [timerName, startTime]) {
      let index = state.timerList.indexOf(timerName)
      if (index != -1) {
        state.timers[index].refTime = startTime;
      }
    },
    STOP_TIMER(state, timerName) {
      let index = state.timerList.indexOf(timerName)
      if (index != -1) {
        state.timers[index].state = 0;
        state.timers[index].refTime = null;

      } else {
        console.log("STOP_TIMER(): skipping, since timer does not exist in state. timerName=" + timerName)
      }
    },

    START_TIMER(state, [timerName, refTime]) {

      let index = state.timerList.indexOf(timerName)
      console.log("START_TIMER mutation called for index=" + index + ", timerName=" + timerName)
      if (index != -1) {
        state.timers[index].refTime = refTime;
        state.timers[index].state = 1;
      } else {
        console.log("START_TIMER(): skipping, since timer does not exist in state. timerName=" + timerName)
      }

    },

    /************************************************************************* */

    resetCallStateAfterDisposition(state) {
      console.log("resetCallStateAfterDisposition() clearing Call Parameters and making them NULL")
      //clearing call data to make it ready for the next call

      // acquire initial state
      const s = initialState()
      Object.keys(s.call).forEach(key => {
        state.call[key] = s.call[key]
      })

      Object.keys(s.callDisposition).forEach(key => {
        state.callDisposition[key] = s.callDisposition[key]
      })

      Object.keys(s.clickToDialRequest).forEach(key => {
        state.clickToDialRequest[key] = s.clickToDialRequest[key]
      })

      Object.keys(s.sfRecord).forEach(key => {
        state.sfRecord[key] = s.sfRecord[key]
      })

      Object.keys(s.timerControl).forEach(key => {
        state.timerControl[key] = s.timerControl[key]
      })

      state.app.state = APP_STATES.LOGGED_IN
      state.call.state = CALL_STATES.IDLE
    },

  },
  actions: {
    setDialerDispositionCode({ commit }, code) {
      commit('SET_DIALER_DISPOSITION_CODE', code)
    },
    resetDialerDispositionCode({ commit }) {
      commit('SET_DIALER_DISPOSITION_CODE', 'success')
    },

    sendLogsToServer({ getters }, message) {
      let reqParams = getters.clientLogRequestParams;
      reqParams.message = message;
      this._vm.$socket.emit("CLIENT_LOGS", reqParams, response => {
        console.log("sent logs to server, response:", response)
      })
    },
    registerTab({ getters, commit, dispatch }) {

      /*********************  Periodically check if tab is in foreground  ****************************/
      setInterval(function () {
        updateVisibilityChange();
      }, 1000)

      let tabCount, tabArray, tabState;
      let lsTabCount = localStorage.getItem('tabCount')
      let lsTabArray = localStorage.getItem('tabArray')
      let lsTabState = localStorage.getItem('tabState')

      console.log("registerTab(): lsTabCount=", lsTabCount, ", lsTabArray=", lsTabArray, ", lsTabState=", lsTabState)

      if (lsTabCount && lsTabArray && lsTabState) {
        console.log("registerTab(): retrieving existing tabs object")
        tabCount = lsTabCount;
        tabArray = JSON.parse(lsTabArray);
        tabState = JSON.parse(lsTabState);
      } else {
        console.log("registerTab(): localstorage variables not found, so creating a new tabs object")
        tabCount = 0;
        tabArray = [];
        tabState = {
        };
      }

      if (!getters.tabId) {
        console.log("registerTab(): getters.tabId is not found, so adding tabCount and adding tabId to array")
        //SessionID based Tab management
        let tabId = (sessionStorage.tabID && sessionStorage.closedLastTab !== '2') ? sessionStorage.tabID : Utils.generateTabId();
        sessionStorage.closedLastTab = '2';
        commit('setTabId', tabId)

        tabCount++;
        tabArray.push(tabId)
        tabState[tabId] = document.visibilityState;

        updateVisibilityChange();
      } else {
        console.log("registerTab(): tabId is found so skipping adding the tab to the array")
      }

      localStorage.setItem('tabCount', tabCount);
      localStorage.setItem('tabArray', JSON.stringify(tabArray))
      localStorage.setItem('tabState', JSON.stringify(tabState))


      /*****************************************************************
      * Visibility State Change Listenener.
      * This listener is invoked whenever the document's visibility state changes. 
      * Note that this state does not get invoked when the window is switched using alt+tab etc.
      ****************************************************************/
      document.addEventListener("visibilitychange", function () {
        console.log("registerTab(): document.visibilityChangeEventListener", document.visibilityState);
        updateVisibilityChange();
      });
      function updateVisibilityChange() {

        let lsTabState = localStorage.getItem('tabState')
        let visibleTabCount = 0

        if (lsTabState) {

          let tabState = JSON.parse(lsTabState)
          tabState[getters.tabId] = document.visibilityState
          for (var key in tabState) {
            if (tabState[key] === 'visible') {
              visibleTabCount++;
            }
          }

          localStorage.setItem('tabState', JSON.stringify(tabState))
          localStorage.setItem('visibleTabCount', visibleTabCount)

        } else {
          console.log("registerTab(): lsTabState is not defined")
        }
      }

      /*****************************************************************
      * Initialize localStorage for NavChangeListener on Salesforce
      ****************************************************************/
      let navState;
      let lsNavState = localStorage.getItem('navState');
      if (!lsNavState) {
        navState = {}
      } else {
        navState = JSON.parse(lsNavState);
      }

      if (getters.tabId) {
        if (!navState[getters.tabId]) {
          navState[getters.tabId] = 'hidden'
        }
      } else {
        console.log('registerTab(): adding navState element failed. getters.tabId not valid', getters.tabId)
      }
      localStorage.setItem('navState', JSON.stringify(navState))

      /*****************************************************************
      * Clear localStorage tab data when window unloads
      ****************************************************************/
      window.onunload = function () {
        //session storage based tab management
        sessionStorage.closedLastTab = '1';

        let lsTabCount = localStorage.getItem('tabCount')
        let lsTabArray = localStorage.getItem('tabArray')
        let lsTabState = localStorage.getItem('tabState')
        let lsNavState = localStorage.getItem('navState')
        if (lsTabCount && lsTabArray && lsTabState && lsNavState) {
          let tabCount = lsTabCount;
          let tabArray = JSON.parse(lsTabArray);
          let tabState = JSON.parse(lsTabState);
          let navState = JSON.parse(lsNavState);
          let index = tabArray.indexOf(getters.tabId);
          console.log("entered window.unload function. tabCount=", lsTabCount, ", tabArray=", tabArray);
          tabCount--;
          tabArray.splice(index, 1);
          delete tabState[getters.tabId]
          delete navState[getters.tabId]

          localStorage.setItem('tabCount', tabCount);
          localStorage.setItem('tabArray', JSON.stringify(tabArray))
          localStorage.setItem('tabState', JSON.stringify(tabState))
          localStorage.setItem('navState', JSON.stringify(navState))
        }
      };
    },

    async onAgentLoginBtnClicked({ commit, dispatch, getters }, payload) {

      //generate a subscription ID using the current timestamp and the userId
      let generatedSubscriptionId = Utils.generateSubscriptionId(payload.userId);

      //create the login request packet using the input values entered by the user
      let loginRequest = {
        userId: payload.userId,
        station: payload.station,
        password: payload.password,
        subscriptionId: generatedSubscriptionId,
        auxCodes: []
      };
      //create the socket request
      let socketLoginRequest = getters.socketRequestParams
      console.log(
        "Socket event about to send for socketLogin(): ",
        socketLoginRequest
      );
      try {
        let socketResp = await dispatch('sendSocketLoginRequest', socketLoginRequest);
        console.log("Socket event sent for socketLogin(): ack=", socketResp);
        let acdLoginResp = await dispatch('acdLoginRequest', loginRequest);
        console.log("acdLoginResp", acdLoginResp)
        dispatch('dialerLoginRequest', acdLoginResp)

      } catch (err) {
        console.error(err.message);
      }
    },
    async acdLoginRequest({ dispatch }, loginRequest) {
      return new Promise((resolve, reject) => {

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

              console.log("agentLoginBtnClicked() ACD Login Successful", resp);

              console.log(
                "agentLoginBtnClicked() sessionParams=",
                sessionParams
              );

              let loginPacket = {
                loginRequest: loginRequest,
                sessionParams: sessionParams
              };

              dispatch("processAgentLogin", loginPacket);

              let dialerLoginRequestPacket = sessionParams;
              dialerLoginRequestPacket.userId = loginRequest.userId;

              resolve(dialerLoginRequestPacket)
            } else {
              Vue.notify({
                group: 'error',
                title: 'LOGIN FAILED!',
                text: 'Your login request failed. Please try again, or contact the administrator',
                type: 'error',
                duration: '3000'
              })
              reject();
            }
          })
          .catch(error => {
            console.log(
              "agentLoginBtnClicked(): response failed: error=",
              error
            );
            Vue.notify({
              group: 'error',
              title: 'LOGIN FAILED!',
              text: 'Your login request failed. Please try again, or contact the administrator',
              type: 'error',
              duration: '3000'
            })
          })
      })
    },

    socketLoginRequest(context, socketLoginRequest) {
      this._vm.$socket.emit("LOGIN", socketLoginRequest, response => {
        return response
      }).catch(error => {
        console.error(error.message)
      })
    },

    async dialerLoginRequest({ dispatch, getters, commit }, request) {
      console.log("dialerLoginRequest(): request=", request)
      return new Promise((resolve, reject) => {
        IcwsConnector.dialerLoginRequest(request)
          .then(resp => {
            if (resp.responseCode === 0) {
              console.log("dialerLogin(): successful. resp=", resp);
              if (request.campaignId && request.campaignId !== "") {
                commit("setDialerState", DIALER_STATES.CAMPAIGN_LOGGED_IN)
                Vue.notify({
                  group: 'success',
                  title: 'CAMPAIGN LOGGED IN!',
                  text: 'You are now logged into the campaign.',
                })

              } else {
                setTimeout(() => {
                  if (getters.getDialerCampaignId === "" || getters.getDialerCampaignId === null) {
                    Vue.notify({
                      group: 'warn',
                      type: 'warn',
                      title: 'DIALER CAMPAIGN NOT CURRENTLY ON',
                      text: 'There are no active dialer campaigns. You will be automatically be available for campaign calls when the dialer starts',
                    })
                  }

                }, 5000)

              }
              resolve(resp)

            } else {
              console.log("dialerLogin(): failed. resp=", resp);
              Vue.notify({
                group: 'warn',
                title: 'CAMPAIGN NOT LOGGED IN!',
                text: 'The Auto-Dialer Campaign may not have started yet. You will be logged in automatically once the campaign starts',
              })
              reject(resp)
            }
          })
          .catch(error => {
            console.log("dialerLogin(): failed. error=", error);
            reject(error)
          })
          .finally();
      })
    },


    fetchStatusMessages(context) {
      IcwsConnector.getStatusMessages(context.getters.sessionParams).then(resp => {
        if (resp.data.responseCode === 0) {

          let statusMessages = resp.data.body.statusMessageList;
          console.log("getStatusMessages(): resp=", statusMessages)
          context.commit('setStatusMessages', statusMessages)

        } else {
          console.error("getStatusMessages(): response code not zeo. resp=", resp.data.responseCode)
        }
      }).catch(err => {
        console.error("getStatusMessages(): error=", err)
      }).finally({

      })
    },

    processOnAppMounted(context) {
      // window.onbeforeunload = function () {
      //   return "Please make sure all processing is complete before attempting to refresh";
      // }
      //Get SF UserId , Agent Id, Station, and Password, from salesforce records
      context.dispatch("sf_getUserDetails");
      context.dispatch("sfNavChangeListener");
      //context.dispatch("showSoftphone");
      context.dispatch('registerTab')
      if (context.getters.appState === APP_STATES.AFTER_CALL_WORK) {
        context.dispatch('resumeClockTimer')
      }

      TabManager.init()

    },
    processConnectionError(context) {
      context.commit('connectionError')
    },
    async processConnectionRestored(context) {
      console.log("processConnectionRestored() entered action")
      if (Utils.validateJson(context.getters.sessionParams)) {
        let resp = await context.dispatch('checkAgentLoginStatusFromIcws')
        console.log("checkAgentLoginStatusFromIcws() dispatch finished. resp=", resp);

        context.dispatch("enableClickToDial");

        if (resp.body && resp.body.connectionState === 1) {
          //Send Socket Event to Join a Socket Room if it exists (Used for receiving socket events in multiple tabs)
          context.dispatch('sendJoinRoomSocketEvent');

        } else {
          context.dispatch("processAgentLogout");
        }


      } else {
        console.log("processConnectionRestored() entered else condition of validateJson")
        context.dispatch("processAgentLogout");
      }
      context.commit('connectionRestored');
    },

    sendJoinRoomSocketEvent(context) {
      if (Utils.validateJson(context.getters.socketRequestParams)) {
        this._vm.$socket.emit("JOIN_ROOM", context.getters.socketRequestParams, response => {
          console.log(
            "sendJoinRoomSocketEvent: sent successfully: ack=",
            response
          );
        });
      } else {
        console.log(
          "Skipping sendJoinRoomSocketEvent() since username or subscriptipId are blank"
        );
      }
    },

    sfNavChangeListener({ getters }) {
      var listener = function (payload) {
        console.log('sfNavChangeListener() Navigation change occurred. Payload: ', payload);
        let lsNavState = localStorage.getItem('navState');
        if (lsNavState) {
          let navState = JSON.parse(lsNavState);
          for (var key in navState) {
            navState[key] = 'hidden'
          }
          if (navState[getters.tabId]) {
            navState[getters.tabId] = 'visible'
          }
          localStorage.setItem('navState', JSON.stringify(navState))
        }
      };

      // Register the listener.
      window.addEventListener('load', function () {
        // eslint-disable-next-line no-undef
        sforce.opencti.onNavigationChange({ listener: listener });
      });
    },


    async checkAgentLoginStatusFromIcws(context) {
      console.log("checkAgentLoginStatusFromIcws(): entered action")
      return new Promise((resolve, reject) => {
        console.log("checkAgentLoginStatusFromIcws(): entered promise")
        let headers = context.getters.sessionParams
        if (Utils.validateJson(headers)) {
          return IcwsConnector.getAgentLoginState(headers).then(
            agentStateResp => {
              console.log(
                "checkAgentLoginStatusFromIcws() request successful. resp=",
                agentStateResp
              );
              resolve(agentStateResp)
            }
          ).catch(err => {
            console.log("checkAgentLoginStatusFromIcws() request failed. error=", err)
            reject(err)
          });
        }
      })
    },
    lockAgentStatus(context) {
      context.state.agent.isStatusLocked = true
    },
    unLockAgentStatus(context) {
      context.state.agent.isStatusLocked = false
    },

    /*****************************************************************************************
     * This method is called whenever multiple lead records are returned by salesforce lookup. 
     * From the leads, the mobile number field is compared with the caller's CLI,
     * and only the matching lead record is used for screenpop and disposition
     **************************************************************************************/
    selectLeadFromMultipleLeads(context, payload) {

      let leadCount = payload.leads.length;
      let selectedRecord = { lead: null };

      for (let x = 0; x < leadCount; x++) {
        if (payload.leads[x].MobileNo == context.state.call.customerNumber) {
          selectedRecord.lead = payload.leads[x];
        }
      }
      selectedRecord.campaignId = payload.campaignId

      //Set the SF record for the record that matches the mobile number.
      context.commit('setSfRecordForMultipleLeadCaller', selectedRecord)
      context.dispatch('sf_updateExistingLead', selectedRecord.lead.leadId)
    },

    /****************************************************
    * Click To Dial Handler
    ****************************************************/
    onClickToDial({ getters, commit, dispatch }) {
      let onClickToDialListener = (payload) => {
        try {
          if (getters.appState === APP_STATES.LOGGED_IN) {
            console.log("onClickToDial(): Clicked phone number: ", payload);


            if (payload.objectType === "Lead" && payload.recordId) {
              commit("setClickToDialSfRecord", payload);
              console.log(
                "onClickToDial(): payload.objectType=",
                payload.objectType,
                " payload.recordId=",
                payload.recordId
              );

              if (payload.number && payload.number !== "") {
                console.log(
                  "committing payload number since it is valid. number=",
                  payload.number
                );

                commit("setCallCustomerNumber", payload.number);

                dispatch('getCountryCodeVirtualNumberFromLead', payload);
              }
            } else {
              console.log(
                "onClickToDial(): payload type was either not equal to LEAD or recordID was invalid"
              );
            }
          } else {
            console.log("onClickToDial(): agent state was not logged in");
          }
        } catch (error) {
          console.log(error);
        }
      };

      // Register the listener.
      window.addEventListener("load", () => {
        console.log("adding onClickToDial event Listener");
        // eslint-disable-next-line no-undef
        sforce.opencti.onClickToDial({ listener: onClickToDialListener });
      });
    },

    /******************Get Country Code and virtual number for manual outbound call**********************/
    getCountryCodeVirtualNumberFromLead({ commit, getters, dispatch }, clickedRecord) {
      let leadId = clickedRecord.recordId
      console.log("getCountryCodeVirtualNumberFromLead() entered function");
      let param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "getCountryCodeVirtualNumberFromLead",
        methodParams: "strLeadId=" + leadId
      };
      dispatch('sendLogsToServer', param)

      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          console.log(
            "getCountryCodeVirtualNumberFromLead(): response successful. response.returnValue.runApex=",
            response.returnValue.runApex
          );
          let jsonResp = JSON.parse(response.returnValue.runApex);
          commit(
            "setCallVirtualNumber",
            jsonResp.Virtual_Number_Text__c
          );
          commit("setCallCountryCode", jsonResp.Country_Code__c);
          dispatch('makeOutboundCall', clickedRecord);
        } else {
          console.error(
            "getCountryCodeVirtualNumberFromLead(): response failure. response.errors=",
            response.errors
          );
        }
      };
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    /*************** Action to call ICWS function to make outbound call *********************/
    makeOutboundCall({ getters, commit, dispatch }, clickedRecord) {
      console.log("makeOutboundCall(): entered action")
      let countryCodeWithPlus = getters.countryCode;

      if (countryCodeWithPlus) {
        commit("setCallStateClickToDial", clickedRecord);

        let countryCodeWithoutPlus = countryCodeWithPlus.replace("+", "");
        let prefix;

        console.log("makeOutboundCall(): retreived countryCodeWithoutPlus=", countryCodeWithoutPlus)
        //Check country code, to apply treatment for Indian vs Interantional Numbers
        if (countryCodeWithoutPlus === "91") {
          //For Indian numbers, do not add any prefix

          prefix = ""
        } else {
          //For International numbers, add a  prefix of 0 to work with the Genesys Dial-plan
          prefix = "0"
        }

        let outboundCallNumber = "" + prefix + countryCodeWithoutPlus + getters.customerNumber;
        let outboundCallRequest = {
          header: getters.sessionParams,
          body: {
            targetNumber: outboundCallNumber
          }
        };

        IcwsConnector.createOutboundCall(outboundCallRequest)
          .then(resp => {
            console.log("icwsCreateOutboundCall(): response successful. resp=", resp);

            if (resp.data.responseCode === 0) {
              console.log("icwsCreateOutboundCall(): Successful", resp);

              commit("resetCallProcesses");
              dispatch("icws_updateAgentStatusMessage", "Outbound Call");

            } else {
              console.log(
                "icwsCreateOutboundCall(): Response received but not successful", resp);
            }
          })
          .catch(error => {
            console.error("icwsCreateOutboundCall(): response failed: " + JSON.stringify(error));
          });
      } else {
        console.log("makeOutboundCall(): else condition: country code invalid");
        Vue.notify({
          group: 'error',
          title: 'Click to Call Failed',
          text: 'The clicked lead has an invalid country code',
          type: 'error',
          duration: '3000'
        })
      }

    },

    /****************************************************
    * Event Handler for Call Answered Socket Event
    ****************************************************/
    processAgentLogin(context, loginpacket) {
      if (!context.getters.getTimer("agentStateTimer")) {
        context.dispatch("addUpTimer", "agentStateTimer");
      }
      console.log("processAgentLogin sessionParams=", loginpacket.sessionParams)
      context.commit("setSessionParams", loginpacket.sessionParams);
      context.commit("setAgentLoginState", loginpacket.loginRequest);
      context.commit('setForcedLogoutFlag', false)

      context.dispatch('fetchStatusMessages')
      context.dispatch("enableClickToDial")

    },

    /****************************************************
    * Event Handler for Call Answered Socket Event
    ****************************************************/
    processAgentLogout(context) {
      if (context.getters.getTimer("agentStateTimer")) {
        context.dispatch("removeTimer", "agentStateTimer");
      }
      context.dispatch("disableClickToDial");
      context.commit("setAgentStateLogout");
      context.commit('setDialerState', DIALER_STATES.LOGGED_OUT);
      context.commit("resetSessionParams");
      context.commit("resetVuexState");

      window.localStorage.removeItem('sf-cti-connector');
      context.dispatch('sf_getUserDetails')
    },

    /****************************************************
    * Event Handler for Call Answered Socket Event
    ****************************************************/
    processAcwFinished(context) {
      console.log("processAcwFinished() action dispatch started")
      context.commit('stopAcwTimer')
      context.dispatch('stopClockTimer')
      context.commit('resetCallStateAfterDisposition')
    },


    async onCallAnsweredMounted({ getters, dispatch, commit }) {
      //dispatch('processCallAnswered')
    },

    isThisMasterTab({ getters }) {
      console.log("isThisSelectedTab(): result=" + TabManager.isThisSelectedTab())
      console.log("isThisActiveTab(): result=" + TabManager.isThisActiveTab())
      console.log("isThisMasterTab(): entered action")
      let isMasterTab = false
      let tabCount, tabArray, tabState, navState, visibleTabCount
      let lsTabCount = localStorage.getItem('tabCount')
      let lsTabArray = localStorage.getItem('tabArray')
      let lsTabState = localStorage.getItem('tabState')
      let lsNavState = localStorage.getItem('navState')
      let lsVisibleTabCount = localStorage.getItem('visibleTabCount')
      let currentTabId = getters.tabId

      if (lsTabCount && lsTabArray && lsTabState && lsVisibleTabCount && lsNavState) {
        console.log("isThisMasterTab(): ls vars valid")
        tabCount = parseInt(lsTabCount)
        tabArray = JSON.parse(lsTabArray)
        tabState = JSON.parse(lsTabState)
        navState = JSON.parse(lsNavState)
        visibleTabCount = parseInt(lsVisibleTabCount)


        if (tabCount < 2) {
          console.log("isThisMasterTab(): tabCount <2 ")
          isMasterTab = true
        } else {
          if (visibleTabCount !== 1) {
            //if no tabs are visible, pick the most recent active tab
            for (var navKey in navState) {

              console.log("isThisMasterTab(): for navState, navKey=", navKey, ",currentTabId=", currentTabId, ", navState[key]=", navState[navKey])

              if (navState[navKey] === 'visible')
                isMasterTab = (navKey === currentTabId)
            }

            // console.log("isThisMasterTab(): visibleTabCount !== 1")
            // let refTabId = Math.max.apply(Math, tabArray)
            // let currentTabId = parseInt(getters.tabId)
            // isMasterTab = (currentTabId === refTabId)
            // console.log("isThisMasterTab(): currentTabId=", currentTabId, ", refTabId=", refTabId, "isMasterTab=", isMasterTab)

          }
          else {
            console.log("isThisMasterTab(): visible TabCount ===1")
            for (var tabKey in tabState) {
              console.log("isThisMasterTab(): key=", tabKey, ",currentTabId=", currentTabId, ", tabState[key]=", tabState[tabKey])
              if (tabState[tabKey] === 'visible')
                isMasterTab = (tabKey === currentTabId)
            }
          }

        }
        console.log("isThisMasterTab(): returning isMasterTab=", isMasterTab)
        return isMasterTab
      }
    },

    /****************************************************
        * Event Handler for Call Alerting Socket Event
        ****************************************************/
    async processCallAlerting({ getters, dispatch, commit }) {
      console.log("processCallAlerting(): action entered. dispatching isThisMasterTab")
      let isMasterTab = await dispatch('isThisMasterTab')
      console.log("processCallAlerting(): isMasterTab=", isMasterTab)
      if (isMasterTab === true) {

        if (getters.isCampaignCall) {
          console.log("if condition for isCampaignCall");
          dispatch('processCampaignCall')
          dispatch('icws_updateAgentStatusMessage', "Campaign Call")

        } else if (getters.isInboundCall) {

          console.log("else if condition for isInboundCall");
          dispatch('processInboundCall')


        } else if (getters.isOutboundCall) {

          console.log("else if condition for isOutboundCall");
          dispatch('processOutboundCall');

        } else {
          console.log("mounted(): call is neither inbound nor outbound");
        }
      } else {
        console.log("processCallAlerting(): skipping processCallAnswered since this tab DOES NOT have the min count")
      }
      dispatch("showSoftphone");
    },

    /****************************************************
    * Event Handler for Call Answered Socket Event
    ****************************************************/
    async processCallAnswered({ getters, dispatch, commit }) {
      console.log("processCallAnswered(): action entered. dispatching isThisMasterTab")
      let isMasterTab = await dispatch('isThisMasterTab')
      console.log("processCallAnswered(): isMasterTab=", isMasterTab)
      if (isMasterTab === true) {

        if (getters.isCampaignCall) {
          console.log("if condition for isCampaignCall");
          dispatch('processCampaignCall')
          dispatch('icws_updateAgentStatusMessage', "Campaign Call")

        } else if (getters.isInboundCall) {

          console.log("else if condition for isInboundCall");
          dispatch('processInboundCall')


        } else if (getters.isOutboundCall) {

          console.log("else if condition for isOutboundCall");
          dispatch('processOutboundCall');


        } else {
          console.log("mounted(): call is neither inbound nor outbound");
        }
      } else {
        console.log("processCallAnswered(): skipping processCallAnswered since this tab DOES NOT have the min count")
      }
      dispatch("showSoftphone");
    },

    processInboundCall({ getters, commit, dispatch }) {
      console.log("processInboundCall() entered action")
      dispatch('sf_ctiLeadLookup')
    },

    processOutboundCall({ getters, dispatch }) {
      if (
        getters.clickToDialRequest.recordId &&
        getters.clickToDialRequest.objectType
      ) {
        let record = {
          id: getters.clickToDialRequest.recordId,
          type: getters.clickToDialRequest.objectType
        }
        dispatch('screenPopObject', record);
      } else {
        console.log("processOutboundCall() Click To Dial did not return a valid record ID and record Type. record=", getters.clickToDialRequest);
      }
    },

    processCampaignCall({ dispatch, getters }) {
      //build the input arguments
      let methodParams = "cli=" + getters.customerNumber;
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "getVirtualNumberForLatestMissedCall",
        methodParams: methodParams
      };
      dispatch('sendLogsToServer', param)
      //callback function once the apex method returns something
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          //parsing the response since runApex returns a JSON string
          let jsonResp = JSON.parse(response.returnValue.runApex);

          console.log(
            "CTI_OpenCTIConnector/getVirtualNumberForLatestMissedCall(): response successful. response.returnValue=",
            jsonResp
          );
          dispatch("setCallVirtualNumber", jsonResp.Called_Number__c)
        } else {
          console.error(
            "CTI_OpenCTIConnector/getVirtualNumberForLatestMissedCall(): response failure. response.errors=" +
            JSON.stringify(response.errors)
          );

        }
        dispatch('sf_ctiLeadLookup')
      };
      //Invokes API method
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    /*****************************************************************************************
    * Call OPENCTI RunApex method. CTI_Helper class with doPost method created by IBM
    * to get lead ID from CLI and DNIS (customerNumber and virtualNumber)
    ****************************************************************************************/
    sf_ctiLeadLookup({ getters, commit, dispatch }) {

      //build the input arguments
      let countrycode = getters.countryCode
      let countryCodeWithoutPlus = countrycode.replace("+", "");
      let methodParams =
        "virtualNumberCalled=" +
        getters.virtualNumber +
        "&callerPhoneCountryCode=" +
        countryCodeWithoutPlus +
        "&callerPhoneNumber=" +
        getters.customerNumber;
      console.log(
        "CTI_Helper/doPost(): Calling runApex with methodParams=" + methodParams
      );
      var param = {
        apexClass: "CTIHelper_PMT",
        methodName: "doPost",
        methodParams: methodParams
      };
      dispatch('sendLogsToServer', param)
      //callback function once the apex method returns something
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          //parsing the response since runApex returns a JSON string
          let fetchedLeads = JSON.parse(response.returnValue.runApex);

          console.log(
            "CTIHelper_PMT/doPost(): response successful. response.returnValue=",
            fetchedLeads
          );

          if (!fetchedLeads) {
            console.error("CTIHelper_PMT/doPost(): CTI helper returned improper result: " + JSON.stringify(fetchedLeads));
          } else if (!fetchedLeads.leads) {
            console.log("CTIHelper_PMT/doPost(): CTI helper returned results for NEW LEAD");

            //if new lead, create the lead in salesforce, then run the screenpop method inside the createLead method
            dispatch('sf_createNewLead', fetchedLeads);

          } else if (fetchedLeads.leads.length === 1) {
            console.log("CTIHelper_PMT/doPost(): CTI helper returned results for SINGLE EXISTING LEAD");

            //Commit existing lead details and screenpop existing lead
            commit("setSfRecordForExistingLeadCaller", fetchedLeads);
            dispatch('sf_updateExistingLead', fetchedLeads.leads[0].leadId)

            //dispatch('sf_screenPopLead', updatedLeadId)

          } else if (fetchedLeads.leads.length > 1) {
            console.log("CTIHelper_PMT/doPost(): CTI helper returned results for MULTIPLE EXISTING LEADS");

            //if multiple leads returned, compare the CLI with the mobile number returned in the response, and only select the matching lead
            dispatch("selectLeadFromMultipleLeads", fetchedLeads)

          } else {
            console.error("CTIHelper_PMT/doPost(): CTI helper returned improper result: " + JSON.stringify(fetchedLeads));
          }

        } else {
          console.error(
            "CTI_Helper/doPost(): response failure. response.errors=",
            response.errors
          );
        }
      };
      //Invokes API method
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    /****************************************************
     * RUNAPEX method to Create a new lead on salesforce 
     ****************************************************/
    sf_createNewLead({ getters, commit, dispatch }, record) {

      let newLeadPacket = {
        FirstName: "New",
        LastName: "CTI Lead",
        MobilePhone: getters.customerNumber,
        Campaign__c: record.campaignId,
        Country_Code__c: getters.countryCode,
        Virtual_Number_Text__c: getters.virtualNumber,
        Lead_Stage__c: "Open",
        Status: "Open",
        LeadSource: "Virtual No.",
        OwnerId: getters.sfUserId,
        Original_PMT_Owner__c: getters.sfUserId
      };

      console.log("sf_createNewLead(): request packet updated. strLeadInput=", newLeadPacket);

      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "createLead",
        methodParams: "strLeadInput=" + JSON.stringify(newLeadPacket)
      };
      dispatch('sendLogsToServer', param)
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        console.log("sf_createNewLead(): response=", response);

        if (response.success && response.returnValue) {
          let jsonResp = JSON.parse(response.returnValue.runApex);
          console.log("sf_createNewLead(): response successful. response.returnValue=", jsonResp);

          commit("setSfRecordForNewLeadCaller", jsonResp);

          dispatch('sf_screenPopLead', jsonResp.Id)

        } else {
          console.error(
            "sf_createNewLead(): response failure. response.errors=",
            response.errors
          );

          if (response.errors[0].description.includes("Unidentified Virtual Number")
          ) {
            dispatch('addAlert', "danger", "Error: Virtual Number not found in Salesforce")
            throw (response.errors)
          } else {
            dispatch('addAlert', "danger", response.errors[0].description);
            throw (response.errors)
          }
        }
      };

      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    /***********************************************************
     * RUNAPEX method to UPDATE an existing lead on salesforce 
     ***********************************************************/

    sf_updateExistingLead({ dispatch, getters }, leadId) {

      let methodParams =
        "leadIdToUpdate=" +
        leadId +
        "&virtualNumberToUpdate=" +
        getters.virtualNumber +
        "&leadOwner=" +
        getters.sfUserId;

      console.log(
        "calling CTI_OpenCTIConnector/updateLead with methodParams= " +
        methodParams
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "updateLead",
        methodParams: methodParams
      };
      dispatch('sendLogsToServer', param)
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          console.log("sf_updateExistingLead(): response successful. response.returnValue.runApex=", response.returnValue.runApex);
          dispatch('sf_screenPopLead', leadId)

        } else {
          console.error("sf_updateExistingLead(): response failure. response.errors=", response.errors);
        }
      };
      //Invokes API method
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    /****************************************************
     * Helper method to screenpop leads on salesforce
     ****************************************************/
    sf_screenPopLead({ dispatch }, leadId) {
      let record = {
        id: leadId,
        type: "Lead"
      }
      dispatch('screenPopObject', record)
    },

    /****************************************************
     * Open CTI method to perform screenPop on salesforce
     ****************************************************/

    screenPopObject(context, record) {
      if (!context.getters.isScreenPopDone) {
        context.commit('screenPopDone')
        console.log("sf_screenPopLead() : entered the function. recordId=", record.id, " recordType=", record.type);
        // eslint-disable-next-line no-undef
        sforce.opencti.screenPop({
          // eslint-disable-next-line no-undef
          type: sforce.opencti.SCREENPOP_TYPE.SOBJECT,
          params: {
            recordId: record.id,
            entityName: record.type
          },
          callback: callback
        });
        var callback = response => {
          if (response.success) {
            console.log("sf_screenPopLead() successful. returnValue:", response.returnValue);
          } else {
            console.error("sf_screenPopLead() failed. error:" + JSON.stringify(response.errors));
          }
        };
      } else {
        console.log("sf_screenPopLead(): Screenpop was already done so skipping screenpop")
      }
    },

    /****************************************************
    * Event Handler for Call Answered Socket Event
    ****************************************************/
    onAfterCallWorkMounted(context) {
      console.log("onAfterCallWorkMounted() action dispatch started")
    },

    processCallDropped({ commit, dispatch, getters }) {
      let callDirection = getters.callDirection;
      if (getters.appState === APP_STATES.CALL_ANSWERED) {
        commit('setCallTerminationType', 'Answered')
        dispatch('setDialerDispositionCode', "success")
      } else {
        commit('setCallDispositionComments', "Call not connected")
        dispatch('setDialerDispositionCode', "NO ANSWER")
        if (callDirection === CALL_DIRECTION.OUTBOUND) {
          commit('setCallTerminationType', 'Not Answered')

        } else if (callDirection === CALL_DIRECTION.INBOUND) {
          commit('setCallTerminationType', '')

          if (getters.isInboundCall) {
            commit('setCallDispositionComments', "Inbound Call not answerable by agent. Call re-routed to another free agent")
          } else if (getters.isCampaignCall) {
            commit('setCallTerminationType', 'Not Answered')
            commit('setCallDispositionComments', "Campaign Call not answerable by agent. Another attempt will be made by the dialer")
          }
        }

        commit('setCallStartTime', getters.getCallEndTime)


        const duration = 0;
        commit('setCallDuration', duration.toFixed(2));
      }
      commit('setCallStateDropped')
      dispatch('processAcwStarted')
    },
    /****************************************************
    * Event Handler for Call Dropped Socket Event
    ***************************************************/

    async processAcwStarted({ commit, dispatch, getters }) {
      try {
        console.log("processAcwStarted() entered function/try")
        dispatch('showSoftphone')
        dispatch('startClockTimer')
        if (await dispatch('isThisMasterTab') === true) {
          console.log("processAcwStarted(): isThisMasterTab is true")
          // commit('startAcwTimer')

          if (getters.isOutboundCall || getters.isCampaignCall) {
            dispatch('icws_updateAgentStatusMessage', "ACW_ORL")
          } else if (getters.getCallTerminationType !== "Answered") {
            dispatch('icws_updateAgentStatusMessage', "ACW_ORL")

          }

          if (getters.callRecordingId && getters.callRecordingId !== "") {

            console.log("processAcwStarted(): waiting for recording URL")

            let recordingUrl = await dispatch('icws_fetchRecordingUrl')
            console.log("processAcwStarted():  recording URL received")
            if (recordingUrl !== "error") {
              commit('setCallrecordingURL', recordingUrl);
            }
          } else {
            console.log("processAcwStarted(): skipping fetch recording URL since recordingID is not valid")
          }

          dispatch("packCallDisposition")
          /************************************************************************************
          * if the call was not answerable (for example if the call went to alerting),
          * do not insert the call, since the call will be inserted through VCC Admin
          *************************************************************************************/
          if (getters.isCampaignCall && getters.getCallTerminationType === "Not Answered") {
            console.log("processAcwStarted(): skipping insert call, since call was not answerable")
            dispatch('sendLogsToServer', "processAcwStarted(): skipping insert call, since call was not answerable")
          } else {
            dispatch('sf_insertCallRecord')
          }



        } else {
          //dispatch('resumeClockTimer')
          console.error("processAcwStarted(): skipping acw started since this is not the master tab")

        }

      } catch (error) {
        console.error(error)
      }
    },

    /***********************************************************
     * Action is run when dispose button is pressed or ACW timer expires
     **********************************************************/

    manualDisposeCall({ commit, getters, dispatch }, payload) {
      let statusAfterDispose = payload
      commit("stopAcwTimer");
      let comments = (getters.isCampaignCall) ? "Dialer Call" : "";

      commit("setCallDispositionComments", comments);
      //context.commit("packCallDispositionObject");
      if (getters.callDisposition.sfCallId) {
        console.log(
          "manualDisposeCall(): updating call record with blank comments."
        );
        dispatch('updateCallDispositionWithComments')
      } else {
        console.error("the call record could not be updated since the autoDisposeCallId is null")
        Vue.notify({
          group: "error",
          title: "Error",
          text: "Call record disposition failed"
        });

      }

      if (getters.isCampaignCall) {
        dispatch('disposeCallOnDialer', statusAfterDispose);
      } else {
        dispatch('disposeCallOnAcd', statusAfterDispose);
      }
    },
    updateCallDispositionWithComments({ getters, dispatch }) {
      // return new Promise((resolve, reject) => {});
      let autoDispCallId = getters.callDisposition.sfCallId;
      let comments = getters.callDisposition.comments
      console.log(
        "updateCallDispositionWithComments(): autoDisposedCallId=",
        getters.callDisposition.sfCallId
      );
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "updateCallWithComments",
        methodParams:
          "callIdToUpdate=" +
          autoDispCallId +
          "&callComments=" +
          comments
      };
      dispatch('sendLogsToServer', param)
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          console.log(
            "updateCallDispositionWithComments(): response successful. response.returnValue=",
            response.returnValue
          );
          let updateCallDispId = JSON.parse(response.returnValue.runApex);
          console.log(
            "updateCallDispositionWithComments(): Call Disposition ID=",
            updateCallDispId.Id
          );
        } else {
          console.error(
            "updateCallDispositionWithComments(): response failure. response.errors=",
            response.errors
          );
          console.error("Error: The call record could not be inserted");
        }
      };
      //Invokes API method
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    disposeCallOnAcd({ commit, dispatch, getters }, statusAfterDispose) {
      let fullRequestParams = getters.sessionParams;
      fullRequestParams.interactionId = getters.interactionId;
      fullRequestParams.wrapupCode = "success";
      //call/:interactionId/code/:wrapupCode/wrapup
      IcwsConnector.sendWrapUpRequestToGenesys(fullRequestParams)
        .then(resp => {
          console.log(
            "disposeCallOnAcd(): response successful. resp=",
            resp
          );

          if (resp.data.responseCode === 0) {
            console.log(
              "disposeCallOnAcd(): Response Successful. resp=",
              resp
            );
          } else {
            console.log("disposeCallOnAcd(): Response Failed. resp=", resp);

          }
        })
        .catch(error => {
          console.log("disposeCallOnAcd(): error: ", error);
        })
        .finally(() => {
          dispatch("processAcwFinished");
          dispatch('icws_updateAgentStatusMessage', statusAfterDispose);
        });
    },

    disposeCallOnDialer({ getters, dispatch }, statusAfterDispose) {
      let fullRequestParams = getters.sessionParams;
      fullRequestParams.userId = getters.userId;
      fullRequestParams.wrapupCode = getters.getDialerDispositionWrapupCode
      //fullRequestParams.wrapupCode = "NO ANSWER"
      //call/:interactionId/code/:wrapupCode/wrapup
      IcwsConnector.sendWrapUpRequestToDialer(fullRequestParams)
        .then(resp => {

          console.log(
            "disposeCallOnDialer(): response successful. resp=",
            resp
          );

          if (resp.data.responseCode === 0) {
            console.log(
              "disposeCallOnDialer(): Response Successful. resp=",
              resp
            );

          } else {
            console.log("disposeCallOnDialer(): Response Failed. resp=", resp);
          }
        })
        .catch(error => {
          console.log("disposeCallOnDialer(): error: ", error);
        })
        .finally(() => {
          dispatch('resetDialerDispositionCode')
          dispatch('icws_updateAgentStatusMessage', statusAfterDispose);
          dispatch("processAcwFinished")
        });
    },

    /*****************************************************************************
        * Persist Timer related actions:
        ******************************************************************************/


    addUpTimer({ commit }, timerName) {
      commit('ADD_UP_TIMER', timerName)
    },
    addDownTimer({ commit }, timerName) {
      commit('ADD_DOWN_TIMER', timerName)
    },
    removeTimer({ commit }, timerName) {
      commit('REMOVE_TIMER', timerName)
    },
    startTimer({ commit }, [timerName, refTime]) {
      commit("START_TIMER", [timerName, refTime]);
    },

    stopTimer({ commit }, timerName) {
      commit("STOP_TIMER", timerName);
    },
    setTimerStartTime({ commit }, [timerName, startTime]) {
      commit('SET_START_TIME', [timerName, startTime])
    },

    /*****************************************************************************
     * Clock Timer related actions:
     ******************************************************************************/
    startClockTimer({ getters, commit }) {
      let offset = getters.getTargetSeconds;
      let refTime = Number(getters.getCallEndTime)+offset
      console.log("startClockTimer(): refTime=" + refTime)
      commit('SET_REF_TIME', refTime);
      commit('SET_CURRENT_TIME')
      commit('SET_TIMER_CONTROL', TIMER_STATES.CONTROL.START)
      commit('SET_TIMER_STATE', TIMER_STATES.EVENTS.STARTED)
    },
    resumeClockTimer({ getters, commit, dispatch }) {

      commit('SET_CURRENT_TIME')
      commit('SET_TIMER_CONTROL', TIMER_STATES.CONTROL.START)
      commit('SET_TIMER_STATE', TIMER_STATES.EVENTS.STARTED)
      dispatch('startTicking')
    },
    stopClockTimer({ getters, commit }) {
      commit('RESET_REF_TIME');
      commit('SET_TIMER_CONTROL', TIMER_STATES.CONTROL.STOP)
      commit('SET_TIMER_STATE', TIMER_STATES.EVENTS.STOPPED)
    },

    setTimerStateExpired({ getters, commit }) {
      commit('RESET_REF_TIME');
      commit('RESET_CURRENT_TIME');
      commit('SET_TIMER_CONTROL', TIMER_STATES.CONTROL.STOP);
      commit('SET_TIMER_STATE', TIMER_STATES.EVENTS.EXPIRED);
    },
    setCurrentTime({ getters, commit }) {
      commit('SET_CURRENT_TIME')
      let refTime = getters.getRefTime;
      let currentTime = getters.getCurrentTime;
      let timeDifference = refTime - currentTime
      var min = Math.floor((timeDifference / 1000 / 60) % 60);
      min = min < 0 ? 0 : min
      sec = sec < 0 ? 0 : sec
      let minutes = (min >= 10 ? min : "0" + min);
      var sec = Math.ceil((timeDifference / 1000) % 60);
      let seconds = sec >= 10 ? sec : "0" + sec;
      let clockTime = minutes + ":" + seconds;
      commit('SET_CLOCK_TIME', clockTime)
    },
    resetCurrentTime({ commit }) {
      commit('RESET_CURRENT_TIME')
    },

    startTicking({ dispatch, commit }) {
      dispatch('updateTicks')
      let interval = setInterval(function () { dispatch('updateTicks') }, 1000)
      commit('SET_INTERVAL', interval)
    },
    stopTicking({ dispatch, getters }) {
      clearInterval(getters.getInterval);
      dispatch("resetCurrentTime");
    },

    updateTicks({ dispatch, getters }) {
      let refTime = getters.getRefTime;
      let currentTime = getters.getCurrentTime
      if (refTime && currentTime) {
        if (refTime > currentTime) {
          //console.log("updating current time since refTime is greater than currentTime.refTime=", getters.getRefTime, "currentTime=", getters.getCurrentTime)
          dispatch("setCurrentTime");
        } else {
          console.log("expiring the timer since refTime is less than currentTime .refTime=", getters.getRefTime, "currentTime=", getters.getCurrentTime)
          //dispatch('stopTicking')
          dispatch("setTimerStateExpired");
        }
      }

    },

    /******************* Get the recording URL from ICWS connector **********************/

    async icws_fetchRecordingUrl(context) {
      let fullRequestParams = {
        header: context.getters.sessionParams,
        body: {
          recordingId: context.getters.callRecordingId
        }
      }

      console.log("icws_fetchRecordingUrl(): making a call to IcwsConnector with request=", fullRequestParams);

      return new Promise((resolve, reject) => {
        IcwsConnector.fetchRecordingUrl(fullRequestParams).then(resp => {
          console.log("icws_fetchRecordingUrl(): request made resp=", resp.data.body);

          if (resp.data.responseCode === 0) {
            console.log("icws_fetchRecordingUrl(): Successful resp.data.responseCode=", resp.data.responseCode);

            resolve(resp.data.body.uri)
          } else {
            console.log("icws_fetchRecordingUrl(): Failed resp=", resp);
            resolve("error");
          }
        })
          .catch(error => {
            console.log("icws_fetchRecordingUrl(): response failed: ", error);
            resolve("error");
          })
      })
    },

    sf_insertCallRecord({ getters, dispatch, commit }) {

      console.log("sf_insertCallRecord(): entered function")
      let callDispositionPacket = getters.callDisposition
      console.log("sf_insertCallRecord(): callDispositionPacket=", callDispositionPacket);
      console.log(JSON.stringify(callDispositionPacket))
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "disposeFullCall",
        methodParams: "jsonInput=" + JSON.stringify(callDispositionPacket)
      };
      dispatch('sendLogsToServer', param)
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          console.log(
            "sf_insertCallRecord(): response successful. response=",
            response
          );
          let autoCallDisposeResp = JSON.parse(response.returnValue.runApex);
          console.log(
            "sf_insertCallRecord(): Call Disposition ID=",
            autoCallDisposeResp.Id
          );

          commit("setAutoDisposedCallId", autoCallDisposeResp.Id);
        } else {
          console.error(
            "sf_insertCallRecord(): response failure. response.errors=",
            response.errors
          );
        }
      };

      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    packCallDisposition({ commit, getters }) {
      commit('setCallDisposition')
      console.log("setCallDisposition commit complete: callDisposition=", getters.callDisposition)
    },

    icws_updateAgentStatusMessage(context, statusMessage) {
      let updateStateRequest = {
        header: context.getters.sessionParams,
        body: {
          userId: context.getters.socketRequestParams.userId,
          statusId: statusMessage
        }
      };

      IcwsConnector.agentStateChangeRequest(updateStateRequest)
        .then(resp => {
          console.log("setAgentState(): response received: ", resp);

          //resp.responseCode is correct
          if (resp.responseCode === 0) {
            console.log("setAgentState() agentStateChangeRequest Successful", resp);
            //this.$store.commit("agentStateChangeRequest", statusMessage);
          } else {
            console.log("setAgentState() agentStateChangeRequest Failed", resp);
          }
        })
        .catch(error => {
          console.log("setAgentState(): response failed: ", error);
        })
    },

    showSoftphone(context) {
      // eslint-disable-next-line no-undef
      sforce.opencti.isSoftphonePanelVisible({
        callback: (response) => {
          if (response.success) {
            console.log('showSoftphone()/isSoftphoneVisible: API method call executed successfully! returnValue:', response.returnValue);
            if (response.returnValue.visible === false) {

              console.log("showSoftphone(): softphone is not visible. Showing softphone now")
              // eslint-disable-next-line no-undef
              sforce.opencti.setSoftphonePanelVisibility({ visible: true, callback: setSoftphoneVisibilityCallback });

              var setSoftphoneVisibilityCallback = function (response) {
                if (response.success) {
                  console.log('showSoftphone()/isSoftphoneVisible: fetched current softphone state as: ', response.returnValue);

                } else {
                  console.error('showSoftphone()/isSoftphoneVisible: Something went wrong! Errors:', response.errors);
                }
              };
            }
            else {
              console.log("showSoftphone(): softphone is already visible, so skipping showSoftphone method")
            }
          } else {
            console.error('Something went wrong! Errors:', response.errors);
          }
        }
      });
    },

    sf_getUserDetails({ dispatch, commit }) {
      console.log("getSfUserId(): Entered method");
      var param = {
        apexClass: "CTI_OpenCTIConnector",
        methodName: "getUserCtiDetails",
        methodParams: ""
      };
      dispatch('sendLogsToServer', param)
      param.callback = response => {
        dispatch('sendLogsToServer', response)
        if (response.success) {
          console.log("sf_getUserDetails(): response successful. response.returnValue.runApex=", JSON.parse(response.returnValue.runApex));

          let respUserDetails = JSON.parse(response.returnValue.runApex);
          commit("setSalesforceAgentDetails", respUserDetails);

        } else {
          console.error("sf_getUserDetails(): response failure. response.errors=", response.errors);
        }
      };
      //Invokes API method
      // eslint-disable-next-line no-undef
      sforce.opencti.runApex(param);
    },

    setCallVirtualNumber(context, payload) {
      context.commit('setCallVirtualNumber', payload)
    },

    enableClickToDial() {
      // eslint-disable-next-line no-undef
      sforce.opencti.enableClickToDial({
        callback: response => {
          if (response.success) {
            console.log("enableClickToDial() successful returnValue:", response.returnValue);
          } else {
            console.error("enableClickToDial() failed. Errors:", response.errors);
          }
        }
      });
    },
    disableClickToDial() {
      // eslint-disable-next-line no-undef
      sforce.opencti.disableClickToDial({
        callback: response => {
          if (response.success) {
            console.log("disableClickToDial() successful returnValue:", response.returnValue);
          } else {
            console.error("disableClickToDial() failed. Errors:", response.errors);
          }
        }
      });
    },

    SOCKET_ACD_LOGGED_IN(context, payload) {
      console.log("SOCKET_ACD_LOGGED_IN(): payload=", payload)
      context.commit('setAgentAcdState', AGENT_STATES.LOG_IN)
      if (context.state.app.state === APP_STATES.LOGGED_OUT) {
        //context.dispatch("processAgentLogin")
      } else {
        //
      }
    },

    SOCKET_ACD_LOGGED_OUT(context, payload) {
      console.log("SOCKET_ACD_LOGGED_OUT(): payload=", payload)
      context.commit('setAgentAcdState', AGENT_STATES.LOG_OUT)
      context.dispatch("processAgentLogout")
      if (payload.responseMessage === "Forced_Logout") {
        context.commit('setForcedLogoutFlag', true)
      }
    },

    SOCKET_ACD_READY(context, payload) {
      console.log("SOCKET_ACD_READY(): Socket event received. payload=", payload)
    },

    SOCKET_ACD_DISPOSITION(context, payload) {
      console.log("SOCKET_ACD_DISPOSITION(): Socket event received. payload=", payload)

      context.dispatch('processAcwFinished')
    },

    SOCKET_DIALER_LOGGED_IN(context, payload) {
      console.log("SOCKET_DIALER_LOGGED_IN(): payload=", payload)
      context.commit('setDialerState', DIALER_STATES.DIALER_LOGGED_IN)
    },

    SOCKET_DIALER_LOGGED_OUT(context, payload) {
      console.log("SOCKET_DIALER_LOGGED_OUT(): payload=", payload)
      context.commit('setDialerState', DIALER_STATES.LOGGED_OUT)

    },

    SOCKET_DIALER_READY(context, payload) {
      console.log("SOCKET_DIALER_READY socket event received. payload=", payload)
    },


    SOCKET_DIALER_DISPOSITION(context, payload) {
      console.log("SOCKET_DIALER_DISPOSITION(): SOcket event received. payload=", payload)
      context.dispatch('processAcwFinished')
    },

    SOCKET_connectionStateChangeMessage(context, payload) {
      //console.log(payload);
    },

    //Socket events sent by ICWS through the ICWS Connector whenever user status changes
    SOCKET_userStatusMessage(context, payload) {



      if (payload.userStatusList.length > 0) {
        let agentStatus = payload.userStatusList[0].statusId
        if (agentStatus) {
          context.commit('updateAgentStatus', agentStatus)
        }
      }
      console.log(payload);
      let timer = context.getters.getTimer('agentStateTimer');
      if (timer) {
        console.log("SOCKET_userStatusMessage(): agentStateTimer exists, so starting the timer")
        context.dispatch("startTimer", ["agentStateTimer", payload.timestamp]);
      } else {
        console.log("SOCKET_userStatusMessage(): adding and calling startTimer() since timer does not exist")
        context.dispatch("addUpTimer", "agentStateTimer");
        context.dispatch("startTimer", ["agentStateTimer", payload.timestamp]);

      }
    },

    SOCKET_availableCampaignsMessage({ getters, dispatch, commit }, payload) {
      if (payload.campaignsAdded) {
        if (payload.campaignsAdded.length > 0) {
          if (payload.campaignsAdded[0].name === CONFIG.CAMPAIGN_NAME) {
            commit('setDialerCampaignId', payload.campaignsAdded[0].id)
            let dialerLoginRequestPacket = getters.sessionParams;
            dialerLoginRequestPacket.userId = getters.userId;
            dialerLoginRequestPacket.campaignId = payload.campaignsAdded[0].id

            if (getters.getDialerState !== DIALER_STATES.CAMPAIGN_LOGGED_IN) {
              console.log("SOCKET_availableCampaignsMessage(): attempting dialer login with campaign Id")
              dispatch('dialerLoginRequest', dialerLoginRequestPacket)
            } else {
              console.log("SOCKET_availableCampaignsMessage(): skipping dialer login since agent is already logged in to campaign")
            }

          }
        }
      }
    },

    //Socket events sent by ICWS through the ICWS Connector
    SOCKET_queueContentsMessage(context, payload) {
      let callState, callStateString, interactionId, recordingId, callDirection, callPurpose
      let cli = ''
      let dnis = ''

      /**************  Interaction Added  ************ */
      if (payload.interactionsAdded) {
        if (payload.interactionsAdded.length > 0) {

          let interaction = payload.interactionsAdded[0]
          callState = interaction.attributes.Eic_CallState
          callStateString = interaction.attributes.Eic_CallStateString
          callDirection = interaction.attributes.Eic_CallDirection
          callPurpose = interaction.attributes.Eic_CallPurpose
          interactionId = interaction.interactionId
          recordingId = interaction.attributes.Eic_IRRecordingId

          if (callState !== "Disconnected") {

            //Setting the call direction to either INBOUND or OUTBOUND
            if (callDirection) {
              console.log("SOCKET_queueContentsMessage() received call direction = ", callDirection)
              if (callDirection === "I") {
                context.commit('setCallDirection', CALL_DIRECTION.INBOUND)
              } else if (callDirection === "O") {
                context.commit('setCallDirection', CALL_DIRECTION.OUTBOUND)
              }
            }

            //Setting the call purpose to either Dialer (Auto-campaign call) or ACD call
            if (callPurpose) {
              if (callPurpose === CALL_PURPOSE.DIALER) {
                context.commit("setCallPurpose", CALL_PURPOSE.DIALER)
              } else {
                this.commit("setCallPurpose", CALL_PURPOSE.ACD)
              }
            }

            if (interactionId && interactionId !== '') {
              console.log("SOCKET_queueContentsMessage(): commiting call state values: interactionId=" + interactionId)
              this.commit('setCallInteractionId', interactionId)
            }

            let dnisColonArray = interaction.attributes.Eic_LocalTnRaw.split(":")
            let dnisAtArray = dnisColonArray.length > 0 ? dnisColonArray[dnisColonArray.length > 1 ? 1 : 0] : ''
            dnis = (dnis.length > 0) ? dnis : (dnisAtArray.split("@")[0])
            if (dnis !== '') {
              console.log("SOCKET_queueContentsMessage(): commiting call state values: dnis=" + dnis)

              context.commit('setCallVirtualNumber', dnis)
            }

            let cliColonArray = interaction.attributes.Eic_RemoteTnRaw.split(":")
            let cliAtArray = cliColonArray.length > 0 ? cliColonArray[cliColonArray.length > 1 ? 1 : 0] : ''
            cli = (cli.length > 0) ? cli : (cliAtArray.split("@")[0])
            if (cli !== '') {

              /************************************************************************************
              * Added this logic to temporarily patch the international calling issue 
              * where the GEnesys platform sends a 91 prefix even for international calls. 
              * This issue is to be fixed on Genesys end, and then this piece of code is to be removed
              * *************************************************************************************/
              let temp = cli;


              if (temp.length > 12) {
                if (temp.substring(0, 2) === '91') {
                  //check if the number is longer than 12 digits. If it is, if it starts with 91, strip the 91
                  temp = temp.substring(2, temp.length)
                }
              }
              /************************************************************************************
              * Added this logic to remove the leading zero when parsing the cli. This zero is added
              * in the Genesys platform for international calls.
              * *************************************************************************************/
              if (temp.substring(0, 1) === "0") {
                temp = temp.substring(1, temp.length);
              }

              cli = temp;

              /********End of international calling issue treatment *************************************/

              let parsedCli = parsePhone(cli)
              console.log("SOCKET_queueContentsMessage(): commiting call state values: cli=" + cli)
              console.log("SOCKET_queueContentsMessage(): parsedCli = " + JSON.stringify(parsedCli))


              let custNum = ("" + (parsedCli.areaCode ? parsedCli.areaCode : '') + parsedCli.number)
              let countryCode = "+" + parsedCli.countryCode

              context.commit('setCallCustomerNumber', custNum)
              context.commit('setCallCountryCode', countryCode)
            }
            if (recordingId) {
              console.log("SOCKET_queueContentsMessage(): setting recordingId=" + recordingId)
              context.commit('setCallRecordingId', recordingId)
            } else {
              console.log("SOCKET_queueContentsMessage(): recordingId was not received in the event")
            }
          }
        }
      }
      /**************Interaction Changed**************/
      if (payload.interactionsChanged) {
        if (payload.interactionsChanged.length > 0) {

          callStateString = payload.interactionsChanged[0].attributes.Eic_CallStateString
          callState = payload.interactionsChanged[0].attributes.Eic_CallState
          console.log("SOCKET_queueContentsMessage(): Event received for interactionsChanged: " + "callState=" + (callState ? callState : '-') + ", callStateString=" + (callStateString ? callStateString : '-'))
          recordingId = payload.interactionsChanged[0].attributes.Eic_IRRecordingId
          if (recordingId) {
            console.log("SOCKET_queueContentsMessage(): setting recordingId=" + recordingId)
            context.commit('setCallRecordingId', recordingId)
          } else {
            console.log("SOCKET_queueContentsMessage(): recordingId was not received in the event")
          }
        }
      }

      /**************Interaction Removed************ */
      if (payload.interactionsRemoved) {
        if (payload.interactionsRemoved.length > 0) {
          let removedInteraction = payload.interactionsRemoved[0]

          if (removedInteraction === this.getters.interactionId) {
            let appState = this.getters.appState
            if (appState === APP_STATES.CALL_RINGING || appState === APP_STATES.CALL_DIALING || appState === APP_STATES.CALL_ANSWERED) {

              this.commit('setCallStateDropped')
              this.dispatch('showSoftphone')
              //context.commit('setCallEndTime', payload.timestamp)
            } else {
              console.log("interaction removed but call state invalid")
            }
          } else {
            console.log("interaction removed but interaction ID not matching current call")
          }
        }
      }

      if (callState) {
        switch (callState) {

          case CALL_STATES.ALERTING:
            context.dispatch('disableClickToDial')
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            if (context.getters.appState !== APP_STATES.CALL_RINGING) {


              context.commit('resetCallProcesses')
              context.commit('setCallStateAlerting')
              context.dispatch("processCallAnswered")

              if (this.state.call.callStartDateTime === null) {
                this.commit('setCallStartTime', new Date().valueOf())
              }
            } else {
              console.error("SOCKET_queueContentsMessage(): received duplicate ALERTING event")
            }


            break;

          case CALL_STATES.DIALING:
            context.dispatch('disableClickToDial')
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            if (this.state.call.callStartDateTime === null) {
              this.commit('setCallStartTime', new Date().valueOf())
            }
            break;

          case CALL_STATES.CONNECTED:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            if (context.getters.appState !== APP_STATES.CALL_ANSWERED) {
              context.commit('resetCallProcesses')
              context.commit('setCallStateAnswered')
              context.dispatch("processCallAnswered")

              context.dispatch("showSoftphone")
              if (this.state.call.callStartDateTime === null) {
                this.commit('setCallStartTime', new Date().valueOf())
              }
            } else {
              console.error("SOCKET_queueContentsMessage(): received duplicate CONNECTED event")
            }

            break;

          case CALL_STATES.DISCONNECTED:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            if (context.getters.appState !== APP_STATES.AFTER_CALL_WORK) {
              this.commit('setCallEndTime', payload.timestamp)
              // context.commit('setCallStateDropped')

              context.dispatch('processCallDropped')

              context.dispatch('showSoftphone')
              if (callStateString === 'Disconnected [There Is No Contact Address For Your Station]') {
                Vue.notify({
                  group: 'error',
                  title: 'Click to Call Failed',
                  text: 'Your desk phone seems to be having issues, please try again or contact admin',
                  type: 'error',
                  duration: '3000'
                })
              }

              context.dispatch('enableClickToDial')
            }
            else {
              console.error("SOCKET_queueContentsMessage(): received duplicate DISCONNECTED event")
            }

            break;
          case CALL_STATES.INITIALIZING:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            break;

          case CALL_STATES.MANUAL_DIALING:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            context.dispatch('disableClickToDial')
            break;

          case CALL_STATES.OFFERING:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            context.commit('setCallStateOffering')
            context.dispatch('disableClickToDial')
            break;

          case CALL_STATES.ON_HOLD:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            break;

          case CALL_STATES.PROCEEDING:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            break;

          case CALL_STATES.STATION_AUDIO:
            console.log("SOCKET_queueContentsMessage() Socket message received for callState = " + callState)
            break;
        }
      }

    }
  },

})