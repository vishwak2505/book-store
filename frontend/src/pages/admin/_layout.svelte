<script>
    import { goto } from "@roxi/routify";
    import { loggedIn } from "../../store";
</script>

{#if $loggedIn?.status && $loggedIn?.user === 'admin'}
    <slot></slot>
{:else}
    {$goto('/')}
{/if}