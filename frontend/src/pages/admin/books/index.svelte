<script>
    import { onMount } from "svelte";
    import Search from "../../../components/Search.svelte";
    import Modal from "../../../components/Modal.svelte";
    import { callApi } from "../../../utils/apiCalls";
    import { toast } from "../../../store";

    let books =[];
    let searchBook = '';
    let displayBooks = [];

    let openModal = false;

    let currentBook = {};

    onMount( async() => {
       await getbooks();
    })

    const search = () => {
        displayBooks = books.filter( book => (book.book_name.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const deleteBook = async(bookId) => {
        const res = await callApi(`http://localhost:3001/api/admin/books/deleteById/${bookId}`, 'DELETE');
        if(res === 200){
            $toast.showToast = true;
            $toast.message = 'Successfully deleted the book'
            await getbooks();
        }
        toggleModal();
    }

    const getbooks = async() => {
        books = await callApi('http://localhost:3001/api/admin/books/');
        displayBooks = books.sort((book1, book2) => (book1.id > book2.id) ? 1 : -1);
    }

    const setCurrentBook = (id, name) =>{
        currentBook.name = name;
        currentBook.id = id;
        toggleModal();
    }

    const toggleModal = () => openModal = !openModal;

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
                    <td><button on:click = {()=>{setCurrentBook(book.id, books.book_name)}}>Delete</button></td>
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

{#if openModal}
    <Modal>
        <div on:blur={toggleModal} class="modal__confirm">
            <p>Are you sure you want to delete the book {currentBook.name} ? </p>
            <div class="modal__buttons">
                <button on:click={() => deleteBook(currentBook.id)}>Yes</button>
                <button on:click={toggleModal}>No</button>
            </div>
        </div>
    </Modal>
{/if}
