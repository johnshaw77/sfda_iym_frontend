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
