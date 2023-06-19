import { derived, writable } from "svelte/store";

export let loggedIn = writable({
    status: false,
    user: null
});

export let toast = writable({
    showToast: false,
    message: ""
})
