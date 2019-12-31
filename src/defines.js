export const APP_STATES = Object.freeze({
  LOGGED_OUT: 'LOGGED_OUT',
  LOGGED_IN: 'LOGGED_IN',
  CALL_OFFERING : 'CALL_OFFERING',
  CALL_RINGING: 'CALL_RINGING',
  CALL_ANSWERED: 'CALL_ANSWERED',
  AFTER_CALL_WORK: 'AFTER_CALL_WORK',
  CALL_DIALING: 'CALL_DIALING',
  CONNECTION_ERROR: 'CONNECTION_ERROR'
})
export const CALL_TERMINATION = Object.freeze({
  ANSWERED: 'Answered',
  NOT_ANSWERED: 'Not Answered',
  MISSED: 'Missed'
})
export const CALL_DIRECTION = Object.freeze({
  INBOUND: 'inbound',
  OUTBOUND: 'outbound'
})

export const CALL_PURPOSE = Object.freeze({
  ACD: '0',
  DIALER: '2',
})
export const DIALER_STATES = Object.freeze({
  LOGGED_OUT: "LOGGED_OUT",
  DIALER_LOGGED_IN : "DIALER_LOGGED_IN",
  CAMPAIGN_LOGGED_IN : "CAMPAIGN_LOGGED_IN"
})
export const AGENT_STATES = Object.freeze({
  UNKNOWN: 0,
  LOG_IN: 1,
  LOG_OUT: 2,
  NOT_READY: 3,
  READY: 4,
  WORK_NOT_READY: 5,
  WORK_READY: 6,
  BUSY: 7,
  Text: {
    '0': 'UNKNOWN',
    '1': 'LOG_IN',
    '2': 'LOG_OUT',
    '3': 'NOT_READY',
    '4': 'READY',
    '5': 'WORK_NOT_READY',
    '6': 'WORK_READY',
    '7': 'BUSY'
  }
})


export const TIMER_STATES = Object.freeze({
  STOP: 0,
  START: 1,
  CONTROL: {
    STOP: 0,
    START: 1,
    PAUSE: 2,
  },
  EVENTS: {
    STOPPED: 0,
    STARTED: 1,
    PAUSED: 2,
    EXPIRED: 3
  }


})

export const CALL_STATES = Object.freeze({
  IDLE: 'Idle',

  ALERTING: 'Alerting',
  CONNECTED :'Connected',
  DIALING: 'Dialing',
  DISCONNECTED: 'Disconnected',
  INITIALIZING: 'Initializing',
  MANUAL_DIALING: 'Manual Dialing',
  OFFERING: 'Offering',
  ON_HOLD: 'On Hold',
  PROCEEDING: 'Proceeding',
  STATION_AUDIO: 'Station Audio'
})


export const CONNECTION_STATES = Object.freeze({
  CONNECTED: 'CONNECTED',
  CONNECTING: 'CONNECTING',
  DROPPED: 'DROPPED'
})
