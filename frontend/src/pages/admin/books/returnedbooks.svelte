<script>
    import { onMount } from "svelte";
    import { callApi } from "../../../utils/apiCalls";

    let books = [];
    let returnedBooks = [];
    onMount(async()=>{
        books = await callApi('http://localhost:3001/api/admin/rentedBooks');
        returnedBooks = books.filter( book => book.bookRented_date_of_return !== null);
    })

    const formatDate = (utcDate) => {
        const date = new Date(utcDate);
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return formattedDate;
    }

</script>

<h1>Returned books</h1>
{#if returnedBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Id</th>
            <th>Book Name</th>
            <th>Genre</th>
            <th>Date of issue</th>
            <th>Date of return</th>
            <th>User Id</th>
            <th>User name</th>
        </tr>
    </thead>
    <tbody>
        {#each returnedBooks as book(book)}
            <tr class="books__row">
               <td>{book.book_id}</td>
               <td>{book.bookDetails_book_name}</td>
               <td>{book.bookDetails_genre}</td>
               <td>{formatDate(book.bookRented_date_of_issue)}</td>
               <td>{formatDate(book.bookRented_date_of_return)}</td>
               <td>{book.user_id}</td>
               <td>{book.user_name}</td>
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books</h1>
{/if}