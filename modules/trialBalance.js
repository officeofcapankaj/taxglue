const table = document.getElementById("tbTable")

document.getElementById("addRow").onclick = () => {

const row = table.insertRow()

row.innerHTML = `

<td><input type="text"></td>

<td>
<select>
<option>Assets</option>
<option>Liabilities</option>
<option>Income</option>
<option>Expense</option>
</select>
</td>

<td>
<select>
<option></option>
<option>Capital</option>
<option>Non-Current Assets</option>
<option>Current Assets</option>
<option>Sale</option>
<option>Purchase</option>
</select>
</td>

<td>
<select>
<option></option>
<option>Non-Current Investments</option>
<option>Sundry Debtors</option>
<option>Cash and Bank Balances</option>
<option>Sale of Goods</option>
<option>Sale of Services</option>
<option>Purchase of Goods</option>
<option>Purchase of Services</option>
</select>
</td>

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
main: cells[1].children[0].value,
sub1: cells[2].children[0].value,
sub2: cells[3].children[0].value,
debit: Number(cells[4].children[0].value || 0),
credit: Number(cells[5].children[0].value || 0)

})

}

localStorage.setItem("trialBalance",JSON.stringify(data))

alert("Trial Balance Saved")

}
