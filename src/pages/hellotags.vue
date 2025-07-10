<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'
import supabase from '@/lib/supabaseClient';
import NotificationComponent from '@/components/NotificationComponent.vue';

const tagsData = ref(null)
const tagsPerPage = ref('all')
const dialog = ref(false)
const notification = ref({
  show: false,
  type: 'warning',
  message: ''
});

const router = useRouter()

function handleSearchTag(tag) {
  router.push(`/tag/${encodeURIComponent(tag)}`)
}

function showNotification(type, message) {
  notification.value = {
    show: true,
    type,
    message
  };
}

function closeNotification() {
  notification.value.show = false;
}

async function getTags(pagination) {
  const query = supabase.from('tags').select('id, title').order('title', {ascending: true});
  if (pagination !== 'all') {
    query.limit(pagination);
  }

  const { data, error } = await query;

  if (error) {
    console.log("Error retrieving tags: ", error);
    showNotification('error', 'Error retrieving tags!');
    return;
  }

  tagsData.value = data;
  showNotification('success', `Loaded ${data.length} tags`);
}

async function deleteUnusedTags() {
  const { data, error } = await supabase.rpc('delete_unused_tags');
  let number = data ?? 0;

  if (error) {
    console.error('Could not clean orphaned tags:', error.message);
    showNotification('error', 'Error deleting unused tags.');
  } else {
    showNotification('success', `${number} unused tag${number !== 1 ? 's' : ''} removed.`);

    setTimeout(() => {
      dialog = false; 
      getTags(tagsPerPage)
    }, 5000);

  }
}

// Initial fetch
onMounted(() => {
  getTags(tagsPerPage.value)
})

</script>

<template>
  <v-container fluid class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Your saved tags
          </v-card-title>
          <v-card-text class="mb-6">
            <v-chip
              v-for="(tag, index) in tagsData"
              :key="index"
              
              variant="tonal"
              color="primary-lighten-3"
              class="cursor-pointer mr-2 mb-2"
              @click="handleSearchTag(tag.title)"
              :title="`Click to search for ${tag.title}`"
            >
              {{ tag.title }}
            </v-chip>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="pa-6" outlined>
          <v-card-title class="text-h4 mb-4">
            Tags do not auto-delete
          </v-card-title>
          <v-card-text class="mb-6">
            <p class="mb-6">Due to their shared nature, tags do not get removed when you delete a bookmark. Should you want to clean up unused tags,
            you can do so by clicking the button below.</p>
            <v-btn @click="dialog = true" color="primary">
              Clean unused tags
            </v-btn>
          </v-card-text>
        </v-card>

        <div class="text-center pa-4">
          <v-dialog
            v-model="dialog"
            max-width="400"
            persistent
          >

            <v-card
              prepend-icon="mdi-alert"
              title="Confirm removal of unused tags"
              text="Are you sure you want to clean unused tags?"
            >
              <template v-slot:actions>
                <v-spacer></v-spacer>

                <v-btn 
                  @click="dialog = false"
                  variant="flat"
                  color="black"
                >
                  No, keep 'em
                </v-btn>

                <v-btn 
                  @click="deleteUnusedTags(); dialog = false" 
                  color="primary"
                  variant="flat"
                >
                  Yes, remove
                </v-btn>
              </template>
            </v-card>
          </v-dialog>
        </div>

      </v-col>
    </v-row>
    <NotificationComponent
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      position="bottom-right"
      @close="closeNotification"
    />
  </v-container>
</template>