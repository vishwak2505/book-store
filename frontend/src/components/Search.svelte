<script>
    export let searchBook;
</script>

<form on:submit|preventDefault class="searchForm">
    <input bind:value={searchBook} class="form__input" type="text" placeholder="Search book">
    <button class="form__submit" type="submit">
        <i class="fa-solid fa-magnifying-glass"></i>
    </button>
</form>