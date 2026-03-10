const data = JSON.parse(localStorage.getItem("trialBalance")) || []

const assets = document.getElementById("assets")
const liabilities = document.getElementById("liabilities")

data.forEach(account => {

if(account.debit > account.credit){

const li = document.createElement("li")
li.textContent = account.account + " : " + account.debit
assets.appendChild(li)

}else{

const li = document.createElement("li")
li.textContent = account.account + " : " + account.credit
liabilities.appendChild(li)

}

})
