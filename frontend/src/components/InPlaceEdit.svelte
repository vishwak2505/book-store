<script>
    import { afterUpdate, onMount } from "svelte";
    import { callApi } from "../utils/apiCalls";
    import { toast } from "../store";

    export let value, property = "", component, booksId = '';
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

          let res;
          if(component === 'userProfile'){
            res = await callApi('http://localhost:3001/api/profile/updateProfile' , 'PATCH', {}, formData, 204);
          }else if(component === 'bookInfo'){
            formData.append('bookId', booksId);
            res = await callApi('http://localhost:3001/api/admin/books/updateBookDetail' , 'PATCH', {}, formData);
          }
          value = (res != 204 && res != 200) ? original : value;
          original = (res != 204 && res != 200 ) ? value : original;

          if(res === 204 || res === 200){
            $toast.showToast = true;
            $toast.message = 'Updated successfully!';
          }

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