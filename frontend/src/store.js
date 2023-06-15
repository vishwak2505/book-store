import { writable } from "svelte/store";

export let loggedIn = writable(false);
export let displayOptions = writable(true);