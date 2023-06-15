<!-- routify:options preload="proximity" -->
<script>
    import Nav from '../components/Nav.svelte';
    import { loggedIn } from '../store.js';
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
    <Nav {loggedIn}></Nav>
    <slot/>
</main>


