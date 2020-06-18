<template>
  <v-container fluid v-if="infiniteScrollPosts">
    <v-row>
      <v-col v-for="post in infiniteScrollPosts.posts" :key="post._id" xs="12" md="6" cols="12">
        <v-card class="pa-2" outlined tile hover>
          <v-img @click.native="viewPost(post._id)" :src="post.imageUrl" height="250px"></v-img>
          <v-card-actions>
            <v-card-title primary>
              <div>
                <div class="headline">{{post.title}}</div>
                <div class="grey--text">{{post.likes}}likes {{post.messages.length}} comments</div>
              </div>
            </v-card-title>
            <v-spacer></v-spacer>

            <v-btn icon @click="show = !show">
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="show">
              <v-list-item class="grow">
                <v-list-item-avatar color="grey darken-3">
                  <v-img class="elevation-6" :src="post.createdBy.avatar"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>{{post.createdBy.username}}</v-list-item-title>
                  <v-list-item-subtitle class="font-weight-thin">Added {{post.createdDate}}</v-list-item-subtitle>
                </v-list-item-content>

                <v-row align="center" justify="end">
                  <v-icon class="mr-1">mdi-information-outline</v-icon>
                  <span class="subheading mr-2">256</span>
                </v-row>
              </v-list-item>
            </div>
          </v-expand-transition>
        </v-card>
      </v-col>
    </v-row>

    <!-- fetch more data -->
    <v-row v-if="infiniteScrollPosts.hasMore">
      <v-col md="12" sm="12" cols="12">
        <div class="d-flex justify-center">
          <v-btn text @click="showMore">fetch more</v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import { INFINITE_SCROLL } from "@/store/queries";

const pageSize = 2;

export default {
  name: "Post",
  data() {
    return {
      show: false,
      pageNumber: 1,
      showMoreEnabled: true
    };
  },
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL,
      variables: {
        pageNum: 1,
        pageSize
      }
    }
  },
  // computed: {},
  methods: {
    showMore() {
      // show more posts
      this.pageNumber += 1;
      this.$apollo.queries.infiniteScrollPosts.fetchMore({
        variables: {
          pageNum: this.pageNumber,
          pageSize
        },
        updateQuery(prevResult, { fetchMoreResult }) {
          const newPosts = fetchMoreResult.infiniteScrollPosts.posts;
          const hasMore = fetchMoreResult.infiniteScrollPosts.hasMore;

          this.showMoreEnabled = hasMore;
          return {
            infiniteScrollPosts: {
              __typename: prevResult.infiniteScrollPosts.__typename,
              // merge prev post with the new post
              posts: [...prevResult.infiniteScrollPosts.posts, ...newPosts],
              hasMore
            }
          };
        }
      });
    },
    viewPost(id) {
      this.$router.push(`/post/${id}`);
    }
  }
};
</script>