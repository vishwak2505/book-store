<script>
    import { onMount } from "svelte";
    import { toast, loggedIn } from "../../store";
    import Search from "../../components/Search.svelte";
    import Modal from "../../components/Modal.svelte";
    import { callApi } from "../../utils/apiCalls";
  import InPlaceEdit from "../../components/InPlaceEdit.svelte";
    let bookName;
    let genre;
    let totalNoOfCopies;
    let costPerDay;

    let books, searchBook = '';
    let displayBooks = [];

    let openForm = false;
    let openUploadForm = false;

    onMount( async() => {
       await getbooks();
    })

    const search = () => {
        displayBooks = books.filter( book => (book.book_name.toLowerCase()).includes(searchBook.toLowerCase()));
    }

    const activateBook = async(bookName) => {
        const res = await callApi(`http://localhost:3001/api/admin/books/reactivateBook?bookName=${bookName}`, 'PATCH');
        if(res === 200){
            $toast.showToast = true;
            $toast.message = 'Successfully activated the book!';
            await getbooks();
        }
    }

    const deactivateBook = async(bookName) => {
        const res = await callApi(`http://localhost:3001/api/admin/books/deleteByName/?bookName=${bookName}`, 'DELETE');
        if(res === 200){
            $toast.showToast = true;
            $toast.message = 'Successfully deactivated the book!';
            await getbooks();
        }
    }

    const getbooks = async() => {
        books = await callApi('http://localhost:3001/api/admin/books/');
        displayBooks = books;
    }

    const toggleModal = () => openForm = !openForm;
    const toggleUploadModal = () => openUploadForm = !openUploadForm;
    

    const addBook = async() => {
        if(checkAvailable() === -1){
            const formData = new FormData();

            formData.append('bookName', bookName);
            formData.append('genre', genre);
            formData.append('totalNoOfCopies', totalNoOfCopies);
            formData.append('costPerDay', costPerDay);
            
            const res = await callApi('http://localhost:3001/api/admin/books/add', 'POST', {}, formData);
            if(res === 201){
                $toast.showToast = true;
                $toast.message = 'The book is added!';
                await getbooks();
            }            
            bookName = genre = totalNoOfCopies = costPerDay = '';
            openForm = false;
        }
    }

    const addBooksList = async() => {
        const formData = new FormData();
        const file = document.querySelector('#uploadBooks #booksList').files[0];
        formData.append('file', file);

        const res = await callApi(`http://localhost:3001/api/admin/books/addBooksFromCSV`, 'POST', {}, formData);
        if(res !== 201){
            $toast.showToast = true;
            $toast.message = 'The books are successfully added!';
            await getbooks();
        }
    }

    const checkAvailable = () =>{
        const isAvailable = books.findIndex(book => book.book_name === bookName);

        if(isAvailable!=-1){
            $toast.showToast = true;
            $toast.message = 'Book is already present';
        }

        return isAvailable;
    }
</script>

<h1>Welcome Admin!</h1>
<div class="actions">
    <Search on:submit = { search } bind:searchBook/>
    <div class="buttons">
        <button class="actions__button" on:click={ toggleModal }>Add Book</button>
        <button class="actions__button" on:click={ toggleUploadModal }>Upload books</button>
    </div>
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
               <td><InPlaceEdit bind:value={book.book_name} property="bookName" booksId = {book.id} component='bookInfo'/></td>
               <td><InPlaceEdit bind:value={book.genre} property="genre" booksId = {book.id} component='bookInfo'/></td>
               <td><InPlaceEdit bind:value={book.total_no_of_copies} property="totalNoOfCopies" booksId = {book.id} component='bookInfo'/></td>
               <td>{book.no_of_copies_rented}</td>
               <td><InPlaceEdit bind:value={book.cost_per_day} property="costPerDay" booksId = {book.id} component='bookInfo'/></td>
       

               {#if book.bookStatus === 'closed'}
               <td>Unavailable</td>
               {:else if book.bookStatus === 'active' && (book.total_no_of_copies === book.no_of_copies_rented)}
               <td>Out of Stock</td>
               {:else}
               <td>Available</td>
               {/if}

               <td>
                    {#if book.bookStatus === 'active'}
                        <button class="books__button" on:click={deactivateBook(book.book_name)} >Deactivate</button>  
                    {:else if book.bookStatus === 'closed'}
                        <button class="books__button" on:click={activateBook(book.book_name)}>Activate</button>
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
    <form id="addBook" class="modal__form" on:submit|preventDefault={addBook}>
        <h1>Add a book</h1>
        <input class="modal__input" type="text" bind:value={bookName} on:input={checkAvailable} name="bookName" placeholder="Book name"/>
        <input class="modal__input" type="text" bind:value={genre} name="genre" placeholder="Genre"/>
        <input class="modal__input" type="text" bind:value={totalNoOfCopies} name="totalNoOfCopies" placeholder="Total no of copies"/>
        <input class="modal__input" type="text" bind:value={costPerDay} name="costPerDay" placeholder="Cost per day"/>
        <input class="modal__submit" type="submit" value="Add book"/>
        <i class="fa-solid fa-xmark modal__close" on:click={toggleModal}></i>
    </form>
</Modal>
{/if}

{#if openUploadForm}
  <Modal>
    <form id="uploadBooks" class="modal__form" on:submit|preventDefault={addBooksList}>
        <h1>Upload books</h1>
        <p>Enter the list of files in csv format here </p>
        <div class="modal__upload">
            <label class="modal__uploadLabel" for="booksList">Upload file</label>
            <input class="modal__uploadInput" type="file" name="booksList" id="booksList">
        </div>
        <input class="modal__submit" type="submit" value="Submit">
        <i class="fa-solid fa-xmark modal__close" on:click={toggleUploadModal}></i>
    </form>
  </Modal>
{/if}