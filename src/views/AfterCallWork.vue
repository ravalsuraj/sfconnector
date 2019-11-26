<template>
  <div class="d-flex flex-column align-items-center justify-content-around mt-4">
    <div class="d-flex justify-content-between w-100">
      <h4 class="font-weight-bold">Dispose Call</h4>
      <h5 class>Time Left: {{finalClockTime}}</h5>
    </div>

    <mdb-btn block color="mdb-color" @click="manualDisposeCall('Available')">Dispose</mdb-btn>
    <mdb-btn block color="info" @click="manualDisposeCall('Personal Break')">Dispose & Break</mdb-btn>
    {{alertBanner.message}}
  </div>
</template>

<script>
import { mdbBtn } from "mdbvue";

export default {
  name: "AfterCallWork",
  components: {
    mdbBtn
  },
  mounted() {},
  props: {},

  data() {
    return {
      
      alertBanner: {
        message: "",
        color: "",
        show: false
      }
    };
  },
  methods: {
    manualDisposeCall(statusAfterDispose) {
      this.$store.dispatch("manualDisposeCall", statusAfterDispose);
    },

    showAlert(color, message) {
      this.alertBanner.message = message;
      this.alertBanner.color = color;
      this.alertBanner.show = true;
    }
  },
  computed: {
    finalClockTime() {
      return this.$store.getters.getClockTime;
    },
  },
};
</script>