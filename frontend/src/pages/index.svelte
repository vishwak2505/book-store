<script>
    import {metatags} from '@roxi/routify';
    import Login from '../components/Login.svelte';
    import Register from '../components/Register.svelte';
    
    metatags.title = 'Bookstore';
    let showLoginForm = true;
</script>
<style type="text/scss">
    @mixin flexCenter($direction:row, $justify:center, $align:center){
        display: flex;
        flex-direction: $direction;
        justify-content: $justify;
        align-items: $align;
    }
    .forms{
        display: flex;
        @include flexCenter(column);
        width: 100%;
        height: 85vh;
        font-size: 1rem;

        &__toggle{
            @include flexCenter(row, space-evenly);
            width: 100%;
            border: 1px solid var(--darker);

            & div{
                width:100%;
                cursor: pointer;
                padding: 2.5%;
                text-align: center;
            }
        }

        &__active{
            min-height: 60vh;
            min-width: 30vw;
            @include flexCenter(row,center,flex-start);
        }
    }

    .active{
        background-color: var(--dark);
        color: var(--lighter);
    }
</style>

<div class="forms">
    <div>
        <div class="forms__toggle">
            <div on:click={()=>{showLoginForm = true}} class:active={showLoginForm}>Login</div>
            <div on:click={()=>{showLoginForm = false}} class:active={!showLoginForm}>Register</div>
        </div>
        {#if showLoginForm}
            <div class="forms__active">
                <Login></Login>        
            </div>
        {:else}
            <div class="forms__active">
                <Register></Register>     
            </div>
        {/if}
    </div>
</div>




