import { supabase } from "./config.js"

export async function login(email, password){

const { data, error } = await supabase.auth.signInWithPassword({
email: email,
password: password
})

if(error){
alert(error.message)
return
}

window.location.href="/app/dashboard.html"

}

export async function logout(){
await supabase.auth.signOut()
window.location.href="/"
}
