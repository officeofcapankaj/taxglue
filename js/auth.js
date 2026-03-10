async function signup() {

  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  alert("Signup successful. Please check email.");
}

async function login() {

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "/dashboard.html";
}
