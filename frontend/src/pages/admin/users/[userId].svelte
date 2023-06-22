<script>
  import { onMount } from "svelte";
  import { callApi } from "../../../utils/apiCalls";
  import { params } from "@roxi/routify";
    let user = {}, rentedBooks = [];

    onMount(async() => {
        user = await callApi(`http://localhost:3001/api/admin/${$params.userId}`);
        rentedBooks = await callApi(`http://localhost:3001/api/admin/rentedBooks`);
    })

    const filterBooks = (books, userId) => books.filter( book => book.user_id === userId);
</script>
<h1>User info:</h1>
<table class="userProfile">
  <tr>
    <td>Profile</td>
    <td>
      <img src={`http://localhost:3001/${user.avatar}`} alt="Profile pic">
    </td>
  </tr>
  <tr>
    <td>User Id</td>
    <td>{user.id}</td>
  </tr>
  <tr>
    <td>Name</td>
    <td>{user.name}</td>
  </tr>
  <tr>
    <td>Email</td>
    <td>{user.email}</td>
  </tr>
  <tr>
    <td>Books rented:</td>
    <td>
      {#if filterBooks(rentedBooks, user.id).length}
        {#each filterBooks(rentedBooks, user.id) as book(book)}
          {book.bookDetails_book_name},
        {/each}
      {:else}
        Nil
      {/if}
    </td>
  </tr>
</table>

