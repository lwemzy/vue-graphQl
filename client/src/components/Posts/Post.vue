<template>
  <v-container fluid v-if="getPost">
    <v-row>
      <v-col md="12" sm="12" cols="12">
        <v-card class="pa-2" elevation="0">
          <v-card outlined tile hover>
            <v-card-title>
              <h3>{{getPost.title}}</h3>
              <v-btn icon color="pink" @click="toggleLike(getPost._id, loggedInUser.username)">
                <v-icon>mdi-heart-outline</v-icon>
              </v-btn>
              <div class="grey--text">{{getPost.likes}} likes</div>
              <v-spacer></v-spacer>
              <v-btn icon color="primary" @click="back()">
                <v-icon>mdi-keyboard-backspace</v-icon>
              </v-btn>
            </v-card-title>
            <v-img :src="getPost.imageUrl" height="500px"></v-img>
            <v-card-actions>
              <v-card-text>
                <span v-for="(category, index) in getPost.categories" :key="index">
                  <v-chip class="mb-3" color="accent" text-color="white">{{category}}</v-chip>
                </span>
                <h3>{{getPost.description}}</h3>
              </v-card-text>
            </v-card-actions>
          </v-card>
          <!-- Messages Section -->
          <v-card class="mt-3">
            <v-col md="12" xs="12" cols="12" v-if="loggedInUser">
              <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="addMsg">
                <v-text-field
                  clearable
                  :append-outer-icon="msg && 'mdi-send'"
                  @click:append-outer="addMsg"
                  label="Add Message"
                  :rules="msgRules"
                  type="text"
                  prepend-icon="mdi-email"
                  required
                  v-model="msg"
                ></v-text-field>
              </v-form>
            </v-col>
          </v-card>

          <v-card class="mt-3">
            <v-col md="12" xs="12" cols="12">
              <v-list>
                <v-subheader>Messages ({{getPost.messages.length}})</v-subheader>

                <template v-for="(message, index) in getPost.messages">
                  <v-divider :key="index"></v-divider>
                  <v-list-item :key="message._id">
                    <v-list-item-avatar>
                      <img :src="message.messageUser.avatar" />
                    </v-list-item-avatar>

                    <v-list-item-content>
                      <v-list-item-title v-text="message.messagesBody"></v-list-item-title>
                      <v-list-item-subtitle v-text="message.messageUser.username"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-spacer></v-spacer>

                    <v-list-item-action>
                      <v-btn icon>
                        <v-icon :color="checkInfoMessage(message) ? 'accent' : 'grey'">mdi-message</v-icon>
                      </v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </template>
              </v-list>
            </v-col>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {
  GET_POST,
  ADD_POST_MESSAGE,
  LIKE_POST,
  UNLIKE_POST
} from "@/store/queries";
import { mapGetters } from "vuex";

export default {
  name: "Post",
  props: ["postId"],
  data() {
    return {
      msg: "",
      isFormValid: true,
      likedPost: false,
      msgRules: [
        message => !!message || "Message can't be empty",
        message =>
          message.length < 50 || "Message must be less than 50 characters"
      ]
    };
  },
  apollo: {
    getPost: {
      query: GET_POST,
      variables() {
        return {
          postId: this.postId
        };
      }
    }
  },
  computed: {
    ...mapGetters(["loggedInUser", "userFavorites"])
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.dialog = !this.dialog;
      }
    },

    async addMsg() {
      if (this.$refs.form.validate()) {
        const variables = {
          msg: this.msg,
          userId: this.loggedInUser._id,
          postId: this.postId
        };

        try {
          const { data } = await this.$apollo.mutate({
            mutation: ADD_POST_MESSAGE,
            variables,
            update: (cache, { data: { addPostMessage } }) => {
              const data = cache.readQuery({
                query: GET_POST,
                variables: {
                  postId: this.postId
                }
              });

              data.getPost.messages.unshift(addPostMessage);

              // add recently added data to old data
              cache.writeQuery({
                query: GET_POST,
                variables: {
                  postId: this.postId
                },
                data
              });
            }
          });

          if (data) {
            this.$refs.form.reset();
          }
        } catch (error) {
          console.error(error);
        }
      }
    },

    checkInfoMessage(message) {
      return (
        this.loggedInUser && this.loggedInUser._id === message.messageUser._id
      );
    },

    toggleLike(postId, username) {
      if (!this.likedPost) {
        this.likedPost = !this.likedPost;
        this.likePost(postId, username);
      } else {
        this.likedPost = !this.likedPost;
        this.unLikePost(postId, username);
      }
    },

    async likePost(postId, username) {
      const { data } = await this.$apollo.mutate({
        mutation: LIKE_POST,
        variables: { postId, username },
        update: cache => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: {
              postId: this.postId
            }
          });

          data.getPost.likes += 1;

          cache.writeQuery({
            query: GET_POST,
            variables: {
              postId: this.postId
            },
            data
          });
        }
      });

      if (data) {
        const updatedUserData = {
          ...this.loggedInUser,
          favorites: data.likePost.favorites
        };
        this.$store.commit("CURRENT_USER", updatedUserData);
      }
    },

    async unLikePost(postId, username) {
      const { data } = await this.$apollo.mutate({
        mutation: UNLIKE_POST,
        variables: { postId, username },
        update: cache => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: {
              postId: this.postId
            }
          });

          data.getPost.likes -= 1;

          cache.writeQuery({
            query: GET_POST,
            variables: {
              postId: this.postId
            },
            data
          });
        }
      });

      if (data) {
        const updatedUserData = {
          ...this.loggedInUser,
          favorites: data.unlikePost.favorites
        };
        this.$store.commit("CURRENT_USER", updatedUserData);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>