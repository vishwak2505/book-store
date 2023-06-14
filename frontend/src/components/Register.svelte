<script>
  let name = '';
  let email = '';
  let password = '';
  let conPassword = '';

  $: submit = async() => {
    try{
      await fetch('http://localhost:3001/user/signup', {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body:JSON.stringify({
         email,
         password
      })
    })
    }catch(e){
      console.log("Error", e);
    }
  }
</script>
<style>
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
    <!-- <input bind:value = {name} type="email" placeholder="Email"><br> -->
    <input bind:value = {email} type="text" placeholder="Email"><br>
    <input bind:value = {password} type="password" placeholder="Password"><br>
    <!-- <input bind:value = {conPassword} type="password" placeholder="Confirm Password"><br> -->
    <input type="submit" value="Register">
</form>