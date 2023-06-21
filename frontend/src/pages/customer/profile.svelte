<script>
  import { onMount } from "svelte";
  import InPlaceEdit from "../../components/InPlaceEdit.svelte";
  import { callApi } from "../../utils/apiCalls";
  let user = {};
  let profileImg = "/assets/profile.png";

  onMount(async () => {
    user = await callApi("http://localhost:3001/api/profile/viewProfile");
    await getProfilePic();
  });

  const updateProfilePic = async (e) => {
    let image = e.target.files[0];

    const formData = new FormData();
    formData.append("avatar", image);
    const res = await callApi('http://localhost:3001/api/profile/updateProfile' , 'PATCH', {}, formData);

    res === 204 ? getProfilePic() : null;
  };

  const getProfilePic = async () => {
    const imgUrl = await callApi('http://localhost:3001/api/profile/avatar', 'GET', {}, null, 200, 'blob');
    console.log(imgUrl);
    profileImg = imgUrl != "" ? imgUrl : "";
  };
</script>

<div class="profile">
  <h1>Profile</h1>
  <div class="profile__grid">
    <div class="profile__image">
      <img src={profileImg} alt="Profile Pic" />
      <input
        type="file"
        accept=".jpg, .jpeg, .png"
        on:change={(e) => updateProfilePic(e)}
      />
    </div>
    <table class="profile__info">
      <tbody>
        <tr>
          <td class="profile__label">User Id</td>
          <td>{user.Id}</td>
        </tr>
        <tr>
          <td class="profile__label">Name</td>
          <td><InPlaceEdit bind:value={user.Name} property="name" /></td>
        </tr>
        <tr>
          <td class="profile__label">Email</td>
          <td><InPlaceEdit bind:value={user.Email} property="email" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
