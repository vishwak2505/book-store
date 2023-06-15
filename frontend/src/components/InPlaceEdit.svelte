<script>
    import { onMount } from "svelte";

    export let value, property = "";
    let editing = false, original;

    onMount(()=>{
        console.log(value, property);
    });

    const edit = () => {
        editing = true;
    }

    const keydown = (event) => {
        if(event.key === 'Escape' && value != original){
            event.preventDefault();
            value = original;
            editing = false
        }
    }

    const submit = async() => {
        if(value != original){
          await fetch("http://localhost:3001/api/profile/updateProfile", {
            method:"POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                property: value
            })
          })
          editing = false;
        }
    }

    const focus = (element) => {
        element.focus();
    }
</script>

<style type="text/scss">
    input{
       font-size: 1.1rem;
       border: 0;
       outline: 0;
       border-bottom: 1px solid #a6a3a2; 
    }
</style>

{#if editing}
    <form on:submit|preventDefault={submit} on:keydown={keydown}>
        <input bind:value on:blur={submit} use:focus>
    </form>
{:else}
    <span on:click={edit}>{value}</span>
{/if}