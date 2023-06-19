<script>
  import { redirect } from "@roxi/routify";
  import { loggedIn, toast} from "../store";
  let name = '';
  let email = '';
  let password = '';
  let isAdmin = false;
  let accessKey = '';

  const validate = async() => {
        if(name === '' || email === '' || password === ''){
          $toast.showToast = true;
          $toast.message = 'Fields cannot be empty';
        }else if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email) === false){
          $toast.showToast = true;
          $toast.message = 'Enter the email in right format';
        }else{
          await submit();
        }
  }

  const submit = async() => {
    const user = isAdmin ? 'admin' : 'user';
    const details = {
      name,
      email,
      password
    };
    
    isAdmin ? details.accessKey = accessKey : null;
    try{
      const response = await fetch(`http://localhost:3001/api/${user}/signup`, {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(details),
        credentials:'include'
      });

      if(response.status == 200){
        const loggedInDetails = {};
        loggedInDetails.status = true;
        if(isAdmin){
          $redirect('/admin');
          loggedInDetails.user = 'admin';
        }else{
          $redirect('/customer');
          loggedInDetails.user = 'customer';
        }
        $loggedIn = loggedInDetails;
        localStorage.setItem('loggedInDetails', JSON.stringify(loggedInDetails));
      }else{
        $toast.showToast = true;
        $toast.message = await response.text();
      }

    }catch(e){
      console.log("Error", e.message);
      console.log("Error", e.status);
    }
  }
</script>

<form class="form" on:submit|preventDefault={validate}>
    <input class="form__input" bind:value = {name} type="text" placeholder="Name"><br>
    <input class="form__input" bind:value = {email} type="email" placeholder="Email"><br>
    <input class="form__input" bind:value = {password} type="password" placeholder="Password"><br>
    <div>
      <input class="form_input" bind:value = {isAdmin} type="checkbox" id="isAdmin">
      <label for="isAdmin">Are you an admin?</label>
    </div>
    {#if isAdmin}
     <input class="form__input" bind:value = {accessKey} type="text" placeholder="Access key">
    {/if}
    <input class="form__submit" type="submit" value="Register">
</form>