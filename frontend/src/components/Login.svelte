<script>
    import { redirect } from "@roxi/routify";
    import { loggedIn, toast } from "../store";    

    let email = '';
    let password = '';
    let isAdmin = false;

    const validate = async() => {
        if(email === '' || password === ''){
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
    try{
      const response = await fetch(`http://localhost:3001/api/${user}/login`, {
        method:'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          email,
          password
        }),
        credentials:'include'
      })
      
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
      $toast.showToast = true;
      $toast.message = 'Server is down';
    }  
  }
</script>
<form class="form" on:submit|preventDefault={validate}>
    <input class="form__input" type="text" placeholder="Email" bind:value={email}><br>
    <input class="form__input" type="password" placeholder="Password" bind:value={password}><br>
    <div>
      <input class="form_input" bind:checked = {isAdmin} type="checkbox" id="isAdmin">
      <label for="isAdmin">Are you an admin?</label>
    </div>
    <input class="form__submit" type="submit" value="Login">
</form>
