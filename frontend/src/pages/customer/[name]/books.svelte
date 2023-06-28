<script>
    import { onMount } from "svelte";
    import Search from "../../components/Search.svelte";
    import { callApi } from "../../utils/apiCalls";
    import { toast } from "../../store";

    let user = {};
    let mybooks = [];

    let borrowedBooks = [], displayBorrowedBooks = [];
    let returnedBooks = [], displayReturnedBooks = [];

    let searchBorrowedBook = '', searchReturnedBook = '';
    onMount( async() => {
        await getMyBooks();
    })

    const search = (status) => {
        if(status === 'borrowed'){
            displayBorrowedBooks = borrowedBooks.filter( book => (book.book_name.toLowerCase()).includes(searchBorrowedBook.toLowerCase()));
        }else{
            displayReturnedBooks = returnedBooks.filter( book => (book.book_name.toLowerCase()).includes(searchReturnedBook.toLowerCase()));
        }        
    }

    const returnBook = async(bookid) => {
        const res = await callApi(`http://localhost:3001/api/user/return/${bookid}`, 'POST');
        if(res === 200){
            $toast.showToast = true;
            $toast.message = 'Book returned successfully!';
            await getbooks();
        }
    }

    const getMyBooks = async() =>{
        user = await callApi('http://localhost:3001/api/profile/viewProfile');
        mybooks = user.rentedBooks;
        borrowedBooks = mybooks.filter( book => book.bookRented_date_of_return === null);
        displayBorrowedBooks = borrowedBooks;
        returnedBooks = mybooks.filter( book => book.bookRented_date_of_return !== null);
        displayReturnedBooks = returnedBooks;
    }

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

<!-- svelte-ignore missing-declaration -->
<h1>Borrowed Books</h1>
<div>
    <Search on:submit = {search.bind(null, 'borrowed')} bind:searchBook = {searchBorrowedBook}/>
</div>
{#if displayBorrowedBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Name</th>
            <th>Genre</th>
            <th>Date of issue</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each displayBorrowedBooks as book(book)}
            <tr class="books__row">
               <td>{book.book_name}</td>
               <td>{book.genre}</td>
               <td>{formatDate(book.bookRented_date_of_issue)}</td>
               {#if book.bookRented_date_of_return === null}
                    <td>
                        <button on:click={()=>returnBook(book.BookId)}>Return</button>
                    </td>
                {:else}
                    <td><button disabled>Return</button></td>
               {/if}
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books</h1>
{/if}


<h1>Returned Books</h1>
<div>
    <Search on:submit = {search.bind(null, 'returned')} bind:searchBook = {searchReturnedBook}/>
</div>
{#if displayReturnedBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Name</th>
            <th>Genre</th>
            <th>Date of issue</th>
            <th>Date of return</th>
        </tr>
    </thead>
    <tbody>
        {#each displayReturnedBooks as book(book)}
            <tr class="books__row">
               <td>{book.book_name}</td>
               <td>{book.genre}</td>
               <td>{formatDate(book.bookRented_date_of_issue)}</td>
               <td>{book.bookRented_date_of_return ? formatDate(book.bookRented_date_of_return) : '-'}</td>
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books</h1>
{/if}