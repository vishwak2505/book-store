<script>
  import { goto } from '@roxi/routify';
  import { loggedIn } from '../store.js';
  
  let openMenu = false;

  const logout = async() => {
    loggedIn.set({
      status: false,
      user: null
    });
    localStorage.setItem('loggedInDetails', JSON.stringify($loggedIn));
    const response = await fetch('http://localhost:3001/api/user/logout',{
      method:'POST',
      credentials:'include'
    });
    openMenu = false;
    if(response.status === 200){
      $goto('/');
    }
  }
  const expandMenu = () => openMenu = !openMenu; 
</script>

<div class="navbar">
    <h1>BOOK STORE</h1>
    {#if $loggedIn.status}
        <img on:click={expandMenu} class="navbar__img" src="/assets/profile.png" alt="Profile">
    {/if}
    
    {#if $loggedIn.status && openMenu}
       <div class="navbar__options">
         {#if $loggedIn.user === 'customer'}
          <a class="navbar__link" href="/customer" on:click={expandMenu}>Home</a>
          <a class="navbar__link" href="/customer/profile" on:click={expandMenu}>My profile</a>
          <a class="navbar__link" href="/customer/books" on:click={expandMenu}>Books</a>
          <a class="navbar__link" href="/customer/books/history" on:click={expandMenu}>History</a>
         {/if}
         {#if $loggedIn.user === 'admin'}
          <a class="navbar__link" href="/admin" on:click={expandMenu}>Home</a>
          <a class="navbar__link" href="/admin/books" on:click={expandMenu}>All books</a>
          <a class="navbar__link" href="/admin/users" on:click={expandMenu}>Users</a>
          <a class="navbar__link" href="/admin/books/rentedbooks" on:click={expandMenu}>Rented books</a>
          <a class="navbar__link" href="/admin/books/returnedbooks" on:click={expandMenu}>Returned books</a>
         {/if}
          <span class="navbar__link" on:click={logout}>Logout</span>
       </div>
    {/if}    
</div>