<script>
  import {loggedIn} from '../store.js';
</script>
<style>
   .container{
     display: flex;
     justify-content: space-between;
     align-items: center;
     background-color: var(--darker);
     color: var(--lighter);
     padding: 0 5%;
   }
   img{
    width: 40px;
    height: 40px;
    cursor: pointer;
   }
</style>
<div class="container">
    <h1>BOOK STORE</h1>
    {#if $loggedIn}
        <img src="/assets/profile.png" alt="Profile">
    {/if}
    
</div>