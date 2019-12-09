import {
    TIMER_STATES,
    TIMER_DIRECTIONS
} from '@/defines.js'

function initialState() {
    return {
        timers: [
        ],
        timerList: [],

    }
}
export default {
    state: initialState,

    mutations: {

        RESET_TIMER_MODULE(state) {
            Object.assign(state, initialState())
        },

        //Persist Timer Mutations:
        ADD_UP_TIMER(state, timerName) {
            let newTimer = {
                state: TIMER_STATES.STOP,
                direction: TIMER_DIRECTIONS.UP,
                refTime: new Date().getTime()
            };
            state.timerList.push(timerName)
            state.timers.push(newTimer)

        },

        ADD_DOWN_TIMER(state, timerName) {
            let newTimer = {
                state: TIMER_STATES.STOP,
                direction: TIMER_DIRECTIONS.DOWN,
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
        STOP_TIMER(state, timerName) {
            let index = state.timerList.indexOf(timerName)
            if (index != -1) {
                state.timers[index].state = 0;
                state.timers[index].refTime = null;

            } else {
                console.log("STOP_TIMER(): skipping, since timer does not exist in state. timerName=" + timerName)
            }
        },

        START_TIMER(state, timerName) {

            let index = state.timerList.indexOf(timerName)
            console.log("START_TIMER mutation called for index=" + index + ", timerName=" + timerName)
            if (index != -1) {
                state.timers[index].refTime = new Date().getTime();
                state.timers[index].state = 1;
            } else {
                console.log("START_TIMER(): skipping, since timer does not exist in state. timerName=" + timerName)
            }

        },

        PAUSE_TIMER(state, timerName) {
            let index = state.timerList.indexOf(timerName)
            state.timers[index].refTime = new Date().getTime();
            state.timers[index].state = 2;
        },
        RESTART_TIMER(state, timerName) {
            let index = state.timerList.indexOf(timerName)
            state.timers[index].refTime = new Date().getTime();
            state.timers[index].state = 3;
            state.timers[index].refTime = new Date().getTime();
        }
    },
    actions: {
        addUpTimer({ commit }, timerName) {
            commit('ADD_UP_TIMER', timerName)
        },
        addDownTimer({ commit }, timerName) {
            commit('ADD_DOWN_TIMER', timerName)
        },
        removeTimer({ commit }, timerName) {
            commit('REMOVE_TIMER', timerName)
        },
        startTimer({ commit }, timerName) {
            commit("START_TIMER", timerName);
        },

        stopTimer({ commit }, timerName) {
            commit("STOP_TIMER", timerName);
        },
    },
    getters: {
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
    }
}