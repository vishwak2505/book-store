<script>
    import { goto, redirect } from "@roxi/routify";
    import {loggedIn} from '../../store';
</script>

{#if $loggedIn?.status && $loggedIn?.user === 'customer'}
  <slot></slot>
{:else}
  {$goto('/')}
{/if}