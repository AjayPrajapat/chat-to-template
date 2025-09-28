<script setup lang="ts">
const router = useRouter()

if (process.client) {
  router.replace('/editor')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200">
    Redirecting to editor...
  </div>
</template>
