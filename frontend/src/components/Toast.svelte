<script>
    import { fly } from "svelte/transition";
    import { toast } from "../store";
    setTimeout( () => $toast.showToast = !$toast.showToast, 2000);
</script>

{#if $toast.showToast}
<div class="toast" transition:fly={{x:30}}>
    {$toast.message}
</div>
{/if}
