<script>
  import { redirect } from "@roxi/routify";
  import '../styles/form.scss';
  import { loggedIn } from "../store";
  let name = '';
  let email = '';
  let password = '';
  let conPassword = '';

  $: submit = async() => {
    try{
      const response = await fetch('http://localhost:3001/api/user/signup', {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email,
          password
        }),
        credentials:'include'
      });

      if(response.status == 200){
        $redirect('/home');
      }
    }catch(e){
      console.log("Error", e.message);
      console.log("Error", e.status);
    }
  }
</script>
<style>
  
</style>
<form class="form" on:submit|preventDefault={submit}>
    <!-- <input bind:value = {name} type="email" placeholder="Email"><br> -->
    <input class="form__input" bind:value = {email} type="text" placeholder="Email"><br>
    <input class="form__input" bind:value = {password} type="password" placeholder="Password"><br>
    <!-- <input bind:value = {conPassword} type="password" placeholder="Confirm Password"><br> -->
    <input class="form__submit" type="submit" value="Register">
</form>