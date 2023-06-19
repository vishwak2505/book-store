<script>
    import { onMount } from "svelte";
    import Search from "../../components/Search.svelte";
    import Modal from "../../components/Modal.svelte";
    import { deleteBookApi, getAdminBooks } from "../../functions/apiCalls";

    let books =[];
    let searchBook = '';
    let displayBooks = [];

    onMount( async() => {
       await getbooks();
    })

    const search = () => {
        displayBooks = books.filter( book => (book.book_name.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const deleteBook = async(bookId) => {
        console.log(bookId);
    }

    const getbooks = async() => {
        books = await getAdminBooks();
        displayBooks = books;
    }

</script>

<h1>All books</h1>
<div class="actions">
    <Search on:submit = { search } bind:searchBook/>
</div>

{#if displayBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Id</th>
            <th>Book Name</th>
            <th>Genre</th>
            <th>Cost per day</th>
            <th>Availability</th>
            <th>Book status</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each displayBooks as books(books)}
            {#each books.books as book(book)}
            <tr class="books__row">
                <td>{book.id}</td>
                <td>{books.book_name}</td>
                <td>{books.genre}</td>
                <td>{books.cost_per_day}</td>
                <td>{book.availability ? 'Yes' : 'No'}</td>
                <td>{books.bookStatus}</td>
                {#if book.availability}
                    <td><button on:click = {()=>{deleteBook(book.id)}}>Delete</button></td>
                {:else}
                    <td><button disabled>Delete</button></td>
                {/if}
             </tr>
            {/each}
        {/each}
    </tbody>
</table>
{:else}
<h1>No books found</h1>
{/if}
