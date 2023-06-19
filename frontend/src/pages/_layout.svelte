<!-- routify:options preload="proximity" -->
<script>
    import Nav from '../components/Nav.svelte';
    import Toast from '../components/Toast.svelte';
    import { loggedIn, toast } from '../store.js';
    
    const loggedInDetails = JSON.parse(localStorage.getItem('loggedInDetails'));
    if(loggedInDetails) $loggedIn = loggedInDetails;
</script>
<style>
    main{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
</style>
<main>
    <Nav></Nav>
    <slot/>
    {#if $toast.showToast}
        <Toast></Toast>
    {/if}
</main>


