import { supabase } from "./config.js"

async function checkAuth(){

const { data:{session} } = await supabase.auth.getSession()

if(!session){
window.location.href="/app/login.html"
}

}

checkAuth()
