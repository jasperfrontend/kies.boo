<script setup>

</script>

<template>
  <div>
    <h1>How to export Bookmarks from your browser into kies.boo</h1>

    <v-card
      :elevation="20"
      color="warning"
      variant="tonal"
      class="pa-4 my-4"
      rounded
    >
      <v-chip>Note:</v-chip> Exporting bookmarks is currently not working on your phone.
      Export your bookmarks from a computer instead.
    </v-card>

    <h2><v-icon icon="mdi-google-chrome" size="20"></v-icon> Export Bookmarks on Chrome</h2>

    <ol>
      <li>At the top right of your Chrome, click the 3 dots menu <v-icon icon="mdi-dots-vertical"></v-icon></li>
      <li>Click <strong>Bookmarks and lists</strong> &gt; <strong>Bookmark Manager</strong>.</li>
      <li>At the top, click the 3 dots menu <v-icon icon="mdi-dots-vertical"></v-icon> then click <strong>Export Bookmarks</strong>.</li>
    </ol>
    <hr class="my-4 text-primary">
    <h2><v-icon icon="mdi-microsoft-edge" size="20"></v-icon> Export Bookmarks on Edge</h2>
    <ol>
      <li>Enter the following into the address bar 
      <code>
        edge://favorites/
      </code></li>

      <li>click the 3 dots menu <v-icon icon="mdi-dots-vertical"></v-icon> on right-top.</li>
      <li>Click Export Favorites.</li>
    </ol>
    <hr class="my-4 text-primary">
    <h2><v-icon icon="mdi-firefox" size="20"></v-icon> Export Bookmarks on Firefox</h2>
    <ol>
      <li>Click the <v-icon icon="mdi-menu" size="16"></v-icon> menu button on right top.</li>
      <li>Click Bookmarks, then Manage Bookmarks on the bottom of the menu.</li>              

        <v-card
          :elevation="0"
          color="info"
          variant="tonal"
          class="pa-1 my-4 w-50"
          rounded
        >
          Or type <kbd>Ctrl-Shift-O</kbd> (not a zero) to open the Bookmarks dialog directly.
        </v-card>

      <li>In the Library window, click "Import and Backup"</li>
      <li>Select "Export Bookmarks to HTML..."</li>
    </ol>
    <hr class="my-4 text-primary">
    <h2><v-icon icon="mdi-apple-safari" size="20"></v-icon> Export Bookmarks on Safari</h2>
    <ol>
      <li>Choose File > Export Browsing Data to File...</li>
      <li>On the "Export Browsing Data" window deselect everything <strong>except Bookmarks</strong>.</li>
      <li>Click Export.</li>
      <li>This saves a .zip file. Extract that zip to find the file containing your bookmarks html file.</li>
      <li>To extract a .zip file on a Mac, simply double-click the zip file. The unzipped file will be placed in the same folder as the original .zip file.</li>
    </ol>
    <p><strong>Do not upload the zip file to kies.boo, it won't work</strong>.</p>
    <hr class="my-4 text-primary">
    <p>Now that you got that bookmark export file, why not <RouterLink to="/import" class="text-primary-lighten-3">import it into kies.boo</RouterLink>?</p>
    <v-btn
      color="primary"
      title="Import bookmarks"
      to="/import"
      prepend-icon="mdi-cloud-upload"
    >
      Import bookmarks
    </v-btn>
  </div>
</template>

<style scoped>
h2, h3, h4, h5, h6 {
  padding: 1rem 0 .5rem;
}

ol, ul {
  padding: .5rem 0 1rem 1.2rem;
}

.copyable-code {
  cursor: pointer;
  background-color: rgba(var(--v-theme-primary), 0.1);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
  transition: all 0.2s ease-in-out;
  display: inline-flex;
  align-items: center;
}

.copyable-code:hover {
  background-color: rgba(var(--v-theme-primary), 0.2);
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-1px);
}

.copyable-code:active {
  transform: translateY(0);
}
</style>

<route lang="yaml">
  meta:
    layout: contentpage
</route>