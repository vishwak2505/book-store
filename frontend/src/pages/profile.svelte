<script>
    import {onMount} from 'svelte';
    import InPlaceEdit from '../components/InPlaceEdit.svelte';
    let user = {};
    onMount( async() => {
        try{
            const userResponse = await fetch('http://localhost:3001/api/profile/viewProfile', 
              {credentials: 'include'}
            );
            const data = await userResponse.json();
            user = data;      
        }catch(e){
            console.log('Error:'+e);
        }
    })
</script>

<style type="text/scss">
    .profile{
        width: 100%;
        padding: 5%;
        box-sizing: border-box;
        font-size: 1.1rem;

        &__grid{
          display: flex;
        }

        &__image img{
            width: 200px;
            height: 200px;
        }

        &__info{
            padding: 5%;
        }

        &__label{
            font-weight: bold;
        }
    }
</style>

<div class="profile"> 
    <h1>Profile</h1>
    <div class="profile__grid">
        <div class="profile__image">
            <img src="https://www.w3schools.com/html/img_girl.jpg" alt="Profile image">
        </div>
        <table class="profile__info">
            <tbody>
                <tr>
                    <td class="profile__label">User Id</td>
                    <td>{user.Id}</td>
                </tr>
                <tr>
                    <td class="profile__label">Name</td>
                    <td><InPlaceEdit bind:value={user.Name} property = 'Name'/></td>
                </tr>
                <tr>
                    <td class="profile__label">Email</td>
                    <td><InPlaceEdit bind:value={user.Email} property = 'Email'/></td>
                </tr>
            </tbody>
        </table>
    </div>
</div>