<script>
    import { onMount } from "svelte";
    import Search from "../components/Search.svelte";
    let user = {};
    let books = [];
    let displayBooks = [];

    let searchBook;
    onMount( async() => {
        try{
            const userResponse = await fetch('http://localhost:3001/api/profile/viewProfile', 
              {credentials: 'include'}
            );
            const data = await userResponse.json();
            user = data;

            const booksResponse = await fetch('http://localhost:3001/api/getbooks/allBooks');
            const booksData = await booksResponse.json();
            books = booksData;
            displayBooks = books;            
        }catch(e){
            console.log('Error:'+e);
        }
    })

    const search = () => {
        displayBooks = books.filter( book => book.book_name.includes(searchBook));
    }

    
</script>

<style type="text/scss">
    %cellStyles{
        border: 1px solid var(--darker);
        text-align: center;
        padding: 1%;
        box-sizing: border-box;
    }
    .books{
        border-collapse: collapse;
        width: 80vw;

        &__row th{
            @extend %cellStyles;
            background-color: var(--darker);
            color: var(--lighter);
            border-color: var(--lighter);
        }

        &__row td{
            @extend %cellStyles;
        }
    }

    button{
      background-color: var(--dark);
      color: var(--lighter);
      padding: 4%;
      border-radius: 10px;
      cursor: pointer;
    }


</style>

<h1>Welcome {user.Name}!</h1>
<div>
    <Search on:submit = {search} bind:searchBook/>
</div>
<table class="books">
    <thead>
        <tr class="books__row">
            <th>Book Name</th>
            <th>Genre</th>
            <th>Cost per day</th>
            <th>No of copies available</th>
            <th>Borrow</th>
        </tr>
    </thead>
    <tbody>
        {#each displayBooks as book(book)}
            <tr class="books__row">
               <td>{book.book_name}</td>
               <td>{book.genre}</td>
               <td>₹{book.cost_per_day}</td>
               <td></td>
               <td>
                   <button>Borrow</button>
               </td>
            </tr>
        {/each}
    </tbody>
</table>



