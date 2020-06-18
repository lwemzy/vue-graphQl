<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="1" outlined>
          <v-card-title>
            <v-toolbar flat>
              <v-toolbar-title>Create Account</v-toolbar-title>
            </v-toolbar>
          </v-card-title>
          <v-card-text>
            <!-- <v-flex xs12 sm12 md12 offset-sm3> -->
            <form-alert v-if="getError" :message="getError.message"></form-alert>
            <!-- </v-flex> -->
            <v-form lazy-validation ref="form">
              <v-text-field
                v-model="user.username"
                :rules="userNameRules"
                label="Username"
                name="username"
                prepend-icon="mdi-account"
                type="text"
              ></v-text-field>

              <v-text-field
                v-model="user.email"
                :rules="emailRules"
                label="Email"
                name="email"
                prepend-icon="mdi-account"
                type="text"
              ></v-text-field>

              <v-text-field
                v-model="user.password"
                :rules="passwordRules"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>

              <v-text-field
                v-model="user.passwordConfirmation"
                :rules="passwordRules"
                label="Password Confirm"
                name="passwordConfirm"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn
              block
              :loading="isLoaded"
              :disabled="isLoaded"
              color="primary"
              @click="submitForm"
            >Signup</v-btn>
          </v-card-actions>
          <h3 class="ma-4">
            Already have an account
            <router-link to="/login">login</router-link>
          </h3>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Signup",
  data() {
    return {
      user: {
        username: "",
        password: "",
        email: "",
        passwordConfirmation: ""
      },
      defaultUser: {
        username: "",
        password: "",
        email: "",
        passwordConfirmation: ""
      },
      userNameRules: [
        // check if user name is provided
        // means its should evaluate to true
        username => !!username || "Username is required",
        // make sure username is less than 10chars
        username =>
          username.length < 10 || "username should be less than 10 characters"
      ],
      passwordRules: [
        password => !!password || "Password is required",
        password =>
          password.length > 4 || "Password must be at least 5 characters",
        confirmation =>
          confirmation === this.user.password || "Passwords must match"
      ],
      emailRules: [
        email => !!email || "Email field is required",
        email => /.@./.test(email) || "Email must be valid"
      ]
    };
  },
  computed: {
    ...mapGetters(["isLoaded", "getError", "loggedInUser"])
  },
  watch: {
    loggedInUser(value) {
      if (value) {
        this.$router.push("/");
      }
    }
  },
  methods: {
    ...mapActions(["signUp"]),
    submitForm(e) {
      e.preventDefault();
      if (this.$refs.form.validate()) {
        this.signUp({ ...this.user });
        this.user = { ...this.defaultUser };
      }
    }
  }
};
</script>
