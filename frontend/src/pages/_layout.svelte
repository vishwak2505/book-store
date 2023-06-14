<!-- routify:options preload="proximity" -->
<script>
    import Nav from '../components/Nav.svelte';
    import { loggedIn } from '../store.js';
</script>
<style>
</style>
<main>
    <Nav {loggedIn}></Nav>
    <slot/>
</main>


