<script>
    import { onMount } from "svelte";
    import { callApi } from "../../utils/apiCalls";
    import Search from "../../components/Search.svelte";
    import { toast } from "../../store";

    let user = {};
    let books = [];
    let displayBooks = [];
    let searchBook = '';

    onMount( async() => {
        user = await callApi('http://localhost:3001/api/profile/viewProfile');
        await getbooks();            
    })

    const getbooks = async() => {
        books = await callApi('http://localhost:3001/api/getbooks/');
        displayBooks = books;
    }

    const search = () => {
        displayBooks = books.filter( book => (book.bookName.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const borrow = async(bookName) => {
        const res = await callApi(`http://localhost:3001/api/user/borrow/{bookName}?bookName=${bookName}`, 'POST');
        if(res === 200){
            $toast.showToast = true;
            $toast.message = 'Book borrowed successfully!';
            await getbooks();
        }
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
                    <td>{book.bookName}</td>
                    <td>{book.genre}</td>
                    <td>₹{book.costPerDay}</td>
                    <td>
                        {#if book.noOfBooksAvailable == 0 || book.bookStatus == 'closed'}
                            <button class="books__button books__unavailable" disabled>
                                {#if book.noOfBooksAvailable != 0}
                                    Out of stock
                                {:else if book.bookStatus != 'closed'}
                                    Unavailable
                                {/if}
                            </button>
                        {:else}
                            <button class="books__button" on:click={()=>borrow(book.bookName)}>Borrow</button>
                        {/if}
                    </td>
                </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books Available</h1>
{/if}


