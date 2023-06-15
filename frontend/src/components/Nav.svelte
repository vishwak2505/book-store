<script>
  import {loggedIn, displayOptions} from '../store.js';

  const checkCookie = (cookieName) => {
      const cookies = document.cookie.split(';');
      for(let cookie of cookies){
        if(cookie.startsWith(cookieName + '=')){
            return true;
        }
      }
      return false;
  }

  $: $loggedIn = checkCookie('auth');
</script>
<style type="text/scss">
   .navbar{
     display: flex;
     justify-content: space-between;
     align-items: center;
     background-color: var(--darker);
     color: var(--lighter);
     box-sizing: border-box;
     padding: 0 5%;
     width: 100%;
     position: relative;

    &__img{
      width: 40px;
      height: 40px;
      cursor: pointer;
    }

    &__options{
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0;
      background-color: var(--darker);
      list-style-type: none;
      display: flex;
      flex-direction: column;
      padding: 0.5% 2%;
    }

    &__link{
      text-decoration: none;
      color: var(--lighter);
      cursor: pointer;
    }
   }
   

</style>
<div class="navbar">
    <h1>BOOK STORE</h1>
    {#if $loggedIn}
        <img class="navbar__img" src="/assets/profile.png" alt="Profile">
    {/if}
    
    {#if $displayOptions}
       <div class="navbar__options">
         <a class="navbar__link" href="/profile">My profile</a>
         <a class="navbar__link" href="/mybooks">My books</a>
         <span class="navbar__link">Logout</span>
       </div>
    {/if}    
</div>