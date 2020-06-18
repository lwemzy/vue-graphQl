<template>
  <v-alert type="error" dismissible transition="scale-transition">{{message}}</v-alert>
</template>

<script>
export default {
  props: ["message"]
};
</script>