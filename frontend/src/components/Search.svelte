<script>
    import "../styles/form.scss";
    export let searchBook;
</script>
<style type="text/scss">
    .form{
        flex-direction: row;
        &__submit{
            padding: 2.5%
        }
    }
</style>
<form on:submit|preventDefault class="form">
    <input bind:value={searchBook} class="form__input" type="text" placeholder="Search book">
    <input class="form__submit" type="submit" value="Search">
</form>