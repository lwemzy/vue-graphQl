<template>
  <v-container fluid>
    <v-layout row>
      <v-dialog v-model="isLoaded" persistent fullscreen>
        <v-container fill-height>
          <v-layout row justify-center align-center>
            <v-progress-circular indertminate :size="70" :width="7" color="secondary"></v-progress-circular>
          </v-layout>
        </v-container>
      </v-dialog>
    </v-layout>

    <v-flex xs12>
      <!-- <p v-if="isLoaded">Loading...</p> -->
      <v-carousel
        v-if="!isLoaded && getCarouselPosts.length > 0"
        v-bind="{ cycle: true }"
        interval="3000"
      >
        <v-carousel-item
          v-for="post in getCarouselPosts"
          :key="post._id"
          :src="post.imageUrl"
          @click.native="viewPost(post._id)"
        >
          <h1 id="carousel__title">{{ post.title }}</h1>
        </v-carousel-item>
      </v-carousel>
    </v-flex>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "Home",
  data() {
    return {
      // posts: [],
    };
  },
  computed: {
    ...mapGetters(["getCarouselPosts", "isLoaded"])
  },
  methods: {
    ...mapActions(["getPosts"]),
    viewPost(id) {
      this.$router.push(`/post/${id}`);
    }
  },
  created() {
    this.getPosts();
  }
};
</script>

<style scoped>
#carousel__title {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5em;
  text-align: center;
  /* margin: 0 auto; */
  bottom: 50px;
  left: 0;
  right: 0;
}
</style>
