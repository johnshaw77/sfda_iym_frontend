// composables/useTeleportVisibility.js
import { ref, onActivated, onDeactivated } from "vue";

export function useTeleportVisibility() {
  const showHeaderContent = ref(true);

  onActivated(() => {
    showHeaderContent.value = true;
  });

  onDeactivated(() => {
    showHeaderContent.value = false;
  });

  return {
    showHeaderContent,
  };
}
