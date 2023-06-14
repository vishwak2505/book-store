<script>
    import { loggedIn } from "../store";

    let email = '';
    let password = '';

    $:submit = () =>{
      console.log('Logged in');
    }
</script>
<style type="text/scss">
  form{
    padding: 20%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }

  input:not([type='submit']){
      border: 0;
      border-bottom: 1px solid #a6a3a2;
      border-radius: 0;
      outline: 0;
  }
  input[type='submit']{
      background-color: var(--dark);
      color: var(--lighter);
      padding: 4%;
      border-radius: 10px;
      cursor: pointer;
  }
  
</style>
<form on:submit|preventDefault={submit}>
    <input type="type" placeholder="Email"><br>
    <input type="password" placeholder="Password"><br>
    <input type="submit" value="Login">
</form>