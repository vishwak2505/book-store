<script>
    import { onMount } from "svelte";
    import Search from "../../../components/Search.svelte";
    import { callApi } from "../../../utils/apiCalls";
    import { toast } from "../../../store";

    let user = {};
    let mybooks = [];

    let returnedBooks = [], displayReturnedBooks = [];

    let searchReturnedBook = '';
    onMount( async() => {
        await getMyBooks();
    })

    const search = () => {
        displayReturnedBooks = returnedBooks.filter( book => (book.book_name.toLowerCase()).includes(searchReturnedBook.toLowerCase()));
                
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

<h1>History</h1>
<div>
    <Search on:submit = {search} bind:searchBook = {searchReturnedBook}/>
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