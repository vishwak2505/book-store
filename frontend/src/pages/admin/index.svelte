<script>
    import { onMount } from "svelte";
    import { toast, loggedIn } from "../../store";
    import Search from "../../components/Search.svelte";
    import Modal from "../../components/Modal.svelte";
    import { addBookApi, deleteBookApi, getAdminBooks } from "../../functions/apiCalls";
    let bookName;
    let genre;
    let totalNoOfCopies;
    let costPerDay;

    let books, searchBook = '';
    let displayBooks = [];

    let openForm = false;

    onMount( async() => {
       await getbooks();
    })

    const search = () => {
        displayBooks = books.filter( book => (book.book_name.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const deleteBook = async(bookName) => {
        await deleteBookApi(bookName);
    }

    const getbooks = async() => {
        books = await getAdminBooks();
        displayBooks = books;
    }

    const toggleModal = () => openForm = !openForm;

    const addBook = async() => {
        const formData = new FormData();

        formData.append('bookName', bookName);
        formData.append('genre', genre);
        formData.append('totalNoOfCopies', totalNoOfCopies);
        formData.append('costPerDay', costPerDay);
        
        const res = await addBookApi(formData);
        (res === 201) ? getbooks() : null;
        
        bookName = genre = totalNoOfCopies = costPerDay = '';

        openForm = false;
    }

    const checkAvailable = () =>{
        const isAvailable = books.findIndex(book => book.book_name === bookName);

        if(isAvailable!=-1){
            $toast.showToast = true;
            $toast.message = 'Book is already present';
        }else{
            addBook();
        }
    }
</script>

<h1>Welcome Admin!</h1>
<div class="actions">
    <Search on:submit = { search } bind:searchBook/>
    <button class="actions__button" on:click={ toggleModal }>Add Book</button>
</div>

{#if displayBooks.length}
<table class="books">
    <thead class="books__head">
        <tr class="books__row">
            <th>Book Name</th>
            <th>Genre</th>
            <th>Total number of copies</th>
            <th>No of copies rented</th>
            <th>Cost per day</th>
            <th>Availability</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        {#each displayBooks as book(book)}
            <tr class="books__row">
               <td>{book.book_name}</td>
               <td>{book.genre}</td>
               <td>{book.total_no_of_copies}</td>
               <td>{book.no_of_copies_rented}</td>
               <td>{book.cost_per_day}</td>
       

               {#if book.bookStatus === 'closed'}
               <td>Unavailable</td>
               {:else if book.bookStatus === 'active' && (book.total_no_of_copies === book.no_of_copies_rented)}
               <td>Out of Stock</td>
               {:else}
               <td>Available</td>
               {/if}

               <td>
                    {#if book.bookStatus === 'active'}
                        {#if book.no_of_copies_rented }
                            <button disabled>Delete</button>
                        {:else}
                            <button on:click={deleteBook(book.book_name)} >Delete</button>
                        {/if}
                    {:else if book.bookStatus === 'closed'}
                        <button>Activate</button>
                    {/if}
               </td>
            </tr>
        {/each}
    </tbody>
</table>
{:else}
<h1>No books found</h1>
{/if}

{#if openForm}
<Modal>
    <form id="addBook" class="modal__form" on:submit|preventDefault={checkAvailable}>
        <h1>Add a book</h1>
        <input class="modal__input" type="text" bind:value={bookName} on:input={checkAvailable} name="bookName" placeholder="Book name"/>
        <input class="modal__input" type="text" bind:value={genre} name="genre" placeholder="Genre"/>
        <input class="modal__input" type="text" bind:value={totalNoOfCopies} name="totalNoOfCopies" placeholder="Total no of copies"/>
        <input class="modal__input" type="text" bind:value={costPerDay} name="costPerDay" placeholder="Cost per day"/>
        <input class="modal__submit" type="submit" value="Add a book"/>
        <i class="fa-solid fa-xmark modal__close" on:click={toggleModal}></i>
    </form>
</Modal>
{/if}