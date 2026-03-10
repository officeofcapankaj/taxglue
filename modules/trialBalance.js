const table = document.getElementById("tbTable")

document.getElementById("addRow").onclick = () => {

const row = table.insertRow()

row.innerHTML = `
<td><input type="text"></td>
<td><input type="number"></td>
<td><input type="number"></td>
`

}

document.getElementById("saveTB").onclick = () => {

let data = []

for(let i=1;i<table.rows.length;i++){

const cells = table.rows[i].cells

data.push({

account: cells[0].children[0].value,
debit: cells[1].children[0].value,
credit: cells[2].children[0].value

})

}

localStorage.setItem("trialBalance",JSON.stringify(data))

alert("Trial Balance Saved")

}
