<script>
    import { onMount } from "svelte";
    import { getBooksApi, getUserProfileApi, borrowBookApi } from '../../functions/apiCalls';
    import Search from "../../components/Search.svelte";

    let user = {};
    let books = [];
    let displayBooks = [];
    let searchBook = '';

    onMount( async() => {
        user = await getUserProfileApi();
        await getbooks();            
    })

    const getbooks = async() => {
        books = await getBooksApi();
        displayBooks = books.filter( book => book.no_of_books_available != 0 && book.bookdetails_bookStatus != 'closed');
    }

    const search = () => {
        displayBooks = books.filter( book => (book.bookdetails_book_name.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const borrow = async(bookName) => {
        const res = await borrowBookApi(bookName);
        (res === 200) ? await getbooks() : null;
    }
    
</script>

<h1>Welcome {user.Name}!</h1>
<div>
    <Search on:submit = {search} bind:searchBook/>
</div>
{#if displayBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Name</th>
            <th>Genre</th>
            <th>Cost per day</th>
            <th>Borrow</th>
        </tr>
    </thead>
    <tbody>
        {#each displayBooks as book(book)}
                <tr class="books__row">
                    <td>{book.bookdetails_book_name}</td>
                    <td>{book.bookdetails_genre}</td>
                    <td>₹{book.bookdetails_cost_per_day}</td>
                    <td>
                        <button class="books__button" on:click={()=>borrow(book.bookdetails_book_name)}>Borrow</button>
                    </td>
                </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books Available</h1>
{/if}


