<script>
    import { afterUpdate, onMount } from "svelte";
    import { updateApi } from "../functions/apiCalls";

    export let value, property = "";
    let editing = false, original;

    onMount(()=>{
        original = value;
    })

    afterUpdate(() => {
        original === undefined ? original = value : null;
    })

    const edit = () => {
        editing = true;
    }

    const submit = async(event) => {
        if(event.key === 'Enter' && value != original){
          const formData = new FormData();
          formData.append(property, value);

          const res = await updateApi(formData);
          value = (res != 204) ? original : value;
          original = (res != 2014 ) ? value : original;

            editing = false;
        }else if(event.key === 'Enter'){
            editing = false;
        }
    }

    const focus = (element) => {
        element.focus();
    }
</script>

{#if editing}
    <form class="inPlaceForm" on:submit|preventDefault={()=>{submit}}>
        <input class="inPlaceForm__input" bind:value use:focus on:keydown={submit}>
    </form>
{:else}
    <span on:click={edit}>{value}</span>
{/if}