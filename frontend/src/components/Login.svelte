<script>
    import { redirect } from "@roxi/routify";
    import '../styles/form.scss';
    import { loggedIn } from "../store";

    let email = '';
    let password = '';

    $: submit = async() => {
    try{
      const response = await fetch('http://localhost:3001/api/user/login', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email,
          password
        }),
        credentials:'include'
      })
      if(response.status == 200){
        $redirect('/home');
      }
    }catch(e){
      console.log("Error", e);
    }

    
  }
</script>
<form class="form" on:submit|preventDefault={submit}>
    <input class="form__input" type="text" placeholder="Email" bind:value={email}><br>
    <input class="form__input" type="password" placeholder="Password" bind:value={password}><br>
    <input class="form__submit" type="submit" value="Login">
</form>