<script>
    import { goto, redirect } from "@roxi/routify";
    import {loggedIn} from '../../../store';
    import { onMount } from "svelte";
    import { callApi } from "../../../utils/apiCalls";

</script>

{#if $loggedIn?.status && $loggedIn?.user === 'customer'}
  <slot></slot>
{:else}
  {$goto('/')}
{/if}