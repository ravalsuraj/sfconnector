<template>
  <div>
    <span>{{formattedTime}}</span>
  </div>
</template>

<script>
import { TIMER_STATES } from '@/defines.js'
export default {
  name: 'PersistTimer',
  props: {
    timerName: String
  },
  data() {
    return {
      formattedTime: '00:00:00',
      timerInterval: null
    }
  },
  mounted() {
    if (this.timerState === TIMER_STATES.START) {
      this.startTicking()
    } else {
      console.log(
        'PersistTimer() mounted(): skipping startTicking(). this.timerState=' +
          this.timerState
      )
    }
  },
  beforeDestroy() {
    this.stopTicking()
  },
  destroyed() {
    clearInterval(this.timerInterval)
  },

  methods: {
    resetFormattedTime() {
      this.formattedTime = '00:00:00'
    },
    startTicking() {
      if (this.timer && this.timerState && this.refTime) {
        this.updateTicks()
        this.timerInterval = setInterval(this.updateTicks, 1000)
      }
    },
    stopTicking() {
      clearInterval(this.timerInterval)
      this.resetFormattedTime()
    },
    updateTicks() {
      let secondMillis = new Date().getTime() - this.refTime
      let seconds = Math.floor(secondMillis / 1000) % 60

      let minutes = Math.floor(secondMillis / 1000 / 60) % 60
      let hours = Math.floor(minutes / 60) % 12
      this.formattedTime =
        '' +
        this.padNumber(hours) +
        ':' +
        this.padNumber(minutes) +
        ':' +
        this.padNumber(seconds)
    },
    padNumber(i) {
      return i < 10 ? '0' + i : i
    },
    setTimer(timer) {
      this.timerState = timer.state
      this.refTime = timer.refTime
    }
  },
  computed: {
    timer() {
      let index = this.$store.getters.getTimerIndex(this.timerName)
      let timer = this.$store.getters.getTimers[index]
      return timer
    },
    timerState() {
      if (this.timer) {
        return this.timer.state
      } else {
        this.stopTicking()
      }
    },
    refTime() {
      if (this.timer) {
        return this.timer.refTime
      } else {
        this.stopTicking()
      }
    }
  },
  watch: {
    refTime(refTimeState) {
      console.log('PersistTimer(): refTime watch() called')
      // if (refTimeState) {
      //   this.startTicking()
      // }

      this.resetFormattedTime()
    },
    timer: {
      deep: true,
      immediate: true,
      handler: function(newState, oldState) {
        console.log(
          'PersistTimer(): timerState watch() called. newState=' +
            JSON.stringify(newState)
        )

        if (newState.state === TIMER_STATES.START) {
          this.startTicking()
        } else if (newState.state === TIMER_STATES.STOP) {
          this.stopTicking()
        }
      }
    }
  }
}
</script>
