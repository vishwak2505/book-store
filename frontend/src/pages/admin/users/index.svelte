<script>
    import { onMount } from "svelte";
    import { callApi } from "../../../utils/apiCalls";
    let users = [];
    let displayUsers = [];
    let rentedBooks = [];
    onMount(async()=>{
        users = await callApi('http://localhost:3001/api/admin/allUsers');
        displayUsers = users;
        rentedBooks = await callApi('http://localhost:3001/api/admin/rentedBooks');
    })

    const filterBooks = (books, userId) => books.filter( book => book.user_id === userId);
</script>

<h1>All the Users</h1>
{#if displayUsers.length}
<table class="user">
    <thead class="users__head">
        <tr class="users__row">
            <th>User Id</th>
            <th>Name</th>
            <th>Email</th>
            <!-- <th>Books rented</th> -->
        </tr>
    </thead>
    <tbody>
        {#each displayUsers as user(user)}
            <tr class="users__row">
               <td>{user.id}</td>
               <td><a href={`/admin/users/${user.id}`}>{user.name}</a></td>
               <td>{user.email}</td>
               <!-- <td>
                {#each filterBooks(rentedBooks, user.id) as book}
                   {book.bookDetails_book_name}<br>
                {/each}
               </td> -->
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No users</h1>
{/if}