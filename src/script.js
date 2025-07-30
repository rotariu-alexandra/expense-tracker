const expenseName = document.querySelector("#expenseName");
const expensePrice = document.querySelector(".expensePrice");
const expenseCategory = document.querySelector("#options");
const datePicker = document.querySelector("#date-picker");
const btnAdd = document.querySelector(".addExpense");


const error =document.querySelector(".error");
let listExpense = document.querySelector(".expense-list");
const totalDiv = document.querySelector(".total");

let expenseArray = [];

let inputSalary = document.querySelector("#budget");

//handle salary
inputSalary.addEventListener("keydown", function(e){

  if(e.key === "Enter") {
   
  error.innerHTML = "";
   saveToLocalStorage();
  }
});

const progressFill = document.querySelector(".progress__fill");

//handle progressBar
function updateProgress() {
  const salary = Number(inputSalary.value);
  const totalExpense = expenseArray.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // check the validate of salary 
  if (!salary || isNaN(salary) || salary <= 0) {
    progressFill.style.width = "0%";
    progressFill.style.backgroundColor = "gray"; // default progressBar
    return;
  }

  const percent = (totalExpense / salary) * 100;
  progressFill.style.width = `${Math.min(percent, 100)}%`;

  // change color for bar
  if (percent < 50) {
    progressFill.style.backgroundColor = "green";
  } else if (percent < 80) {
    progressFill.style.backgroundColor = "orange";
  } else {
    progressFill.style.backgroundColor = "red";
  }

  //error message
  if (percent >= 90) {
  showTemporaryMessage("🚨 You've exceeded your budget!");
} else if (percent >= 80) {
  showTemporaryMessage("⚠️ You're close to reaching your budget!");
}

}

//variables-filter&sort
const filterCategory = document.querySelector("#filter-category");
filterCategory.addEventListener("change", renderFilteredAndSortedExpenses);

const sort = document.querySelector("#sort");
sort.addEventListener("change", renderFilteredAndSortedExpenses);


//filter and sort and search

const searchInput = document.querySelector("#search");
searchInput.addEventListener("input", renderFilteredAndSortedExpenses);

function renderFilteredAndSortedExpenses() {
  listExpense.innerHTML = ""; 
  const selectedCategory = filterCategory.value;
  const selectSort = sort.value;

  // copy
  let filtered = expenseArray.slice();

  //search
  const searchText = searchInput.value.toLowerCase();
  
  //error

  if (searchText !== "") {
    filtered = filtered.filter(exp => exp.title.toLowerCase().includes(searchText));
  }
 

  // filter
  if (selectedCategory !== "") {
    filtered = filtered.filter(exp => exp.category === selectedCategory);
  }

  // sort
  if (selectSort === "name") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (selectSort === "amount-low") {
    filtered.sort((a, b) => Number(a.amount) - Number(b.amount));
  } else if (selectSort === "amount-high") {
    filtered.sort((a, b) => Number(b.amount) - Number(a.amount));
  } else if (selectSort === "date-newest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (selectSort === "date-oldest") {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // result
  filtered.forEach(el => addExpense(el));
  if (filtered.length === 0) {
  showTemporaryMessage("❌ No expenses match your search.");
}
  updateTotal(filtered);
  updateProgress();
}

//form, list..

//handle expense value
//create an object for each expense

function createExpenseObject(){
    return {
    title: expenseName.value,
    amount: expensePrice.value,
    category: expenseCategory.value,
    date: datePicker.value,
    id: Date.now()
    };
}


//add button for list

btnAdd.addEventListener("click", function(event){
  event.preventDefault();
  if (!handleError()) return;
  const expense = createExpenseObject();
  addExpense(expense);
  expenseArray.push(expense);
  updateTotal();
  saveToLocalStorage();
  updateProgress();
  clearInputs();
});




//handle Error

function showTemporaryMessage(message, duration = 3000) {
  error.textContent = message;
  error.classList.add("visible");

  setTimeout(() => {
    error.textContent = "";
    error.classList.remove("visible");
  }, duration);
}


function handleError(){
    if(expenseName.value.trim() === "" || expensePrice.value === "" || expenseCategory.value === "" || datePicker.value === ""){
       showTemporaryMessage("Please enter or select a value!");
        return false;
    }
    else if(expensePrice.value < 0){
        showTemporaryMessage("You can not put negative value!");
        return false;
    }
    error.textContent = "";
    return true;
}




let currentEditId = null;


//handle Add expense function
function addExpense(expense) {

  const li = document.createElement("li");
  li.className = "expense-item";
  li.dataset.id = expense.id; //list element

  const spanTitle = document.createElement("span");
  spanTitle.className = "title";
  spanTitle.textContent = expense.title; //expense title

  const details = document.createElement("div");
  details.className = "details"; //details for each expense

  const amount = document.createElement("span");
  amount.className = "amount";
  amount.textContent = `$${expense.amount}`;

  const infoBtn = document.createElement("span");
  infoBtn.className = "info";
  infoBtn.textContent = "i"; //info with date&category
  
  // create details section
const divExtraDetails = document.createElement("div");
divExtraDetails.className = "extra-details hidden";

const spanDate = document.createElement("span");
spanDate.className = "date";
spanDate.textContent = `📅 ${expense.date}`;

const spanCategory = document.createElement("span");
spanCategory.className = "category";
spanCategory.textContent = `📂 ${expense.category}`;

divExtraDetails.append(spanDate, spanCategory);

// toggling to click on info
infoBtn.addEventListener("click", () => {
  divExtraDetails.classList.toggle("hidden");
});

const editBtn = document.createElement("span");
editBtn.className = "edit";
editBtn.textContent = "🖍";
editBtn.addEventListener("click", () => {
  document.querySelector("#edit-modal").classList.remove("hidden");
  document.querySelector("#edit-title").value = expense.title;
  document.querySelector("#edit-amount").value = expense.amount;
  document.querySelector("#edit-category").value = expense.category;
  document.querySelector("#edit-date").value = expense.date;

  currentEditId = expense.id;
});



//delete button
  const deleteBtn = document.createElement("span");
  deleteBtn.className = "delete";
  deleteBtn.textContent = "X";


  deleteBtn.addEventListener("click", () => {
  li.remove();
  
  

  const id = Number(li.dataset.id); // coercion in number
  const index = expenseArray.findIndex(exp => exp.id === id);
  if (index !== -1) {
    expenseArray.splice(index, 1);
    saveToLocalStorage(); // if something is delete
  }
  updateTotal();
  updateProgress();
});

//create list
  details.append(amount, infoBtn,editBtn, deleteBtn);
  li.append(spanTitle, details, divExtraDetails);
listExpense.appendChild(li);

}

// handle close modal
document.querySelector("#edit-form").addEventListener("submit", function(e){
  e.preventDefault();
  //take the new value and create and Object like the first time
  const updatedExpense = {
    title: document.querySelector("#edit-title").value,
    amount: document.querySelector("#edit-amount").value,
    category: document.querySelector("#edit-category").value,
    date: document.querySelector("#edit-date").value,
    id: currentEditId
  }; 

  const index = expenseArray.findIndex(exp => exp.id === currentEditId);
  console.log({ currentEditId, updatedExpense });
  console.log({ index, expenseFound: expenseArray[index] });

  if(index === -1){
    return; 
  } else {
    expenseArray[index] = {
  ...expenseArray[index],
  ...updatedExpense
};

  }

document.querySelector("#edit-modal").classList.add("hidden");

currentEditId = null;

saveToLocalStorage();
renderFilteredAndSortedExpenses();
updateTotal();
updateProgress();
});

//handle cancel btn

 document.querySelector("#close-modal").addEventListener("click", () => {
  document.querySelector("#edit-modal").classList.add("hidden");
  currentEditId = null;
});

//TO DO: error la input, feedback vizual

function clearInputs() {
  [expenseName, expensePrice, expenseCategory, datePicker].forEach(input => input.value = ""); //clear input value 
}

//handle total
const rightTotal = document.querySelector("#total-expenses");
const progressBarTotal = document.querySelector("#progress-spent");
const remaining = document.querySelector("#remaining-budget");
const remainingBar = document.querySelector("#progress-remaining");

function updateTotal(arrayToSum = expenseArray) {
  let total = 0;
  arrayToSum.forEach(exp => total += Number(exp.amount));

  totalDiv.innerHTML = "";

  //for left side
  rightTotal.innerHTML = "";
  progressBarTotal.innerHTML = "";
  remaining.innerHTML = "";
  remainingBar.innerHTML = "";


  if (total > 0) {
    const totalSpan = document.createElement("span");
    totalSpan.textContent = "Total:";
    const sumSpan = document.createElement("span");
    sumSpan.className = "amount";
    sumSpan.textContent = `$${total}`;
    rightTotal.textContent = sumSpan.textContent;
    progressBarTotal.textContent = sumSpan.textContent;

    //remaining
    const resultRemaining = inputSalary.value - total;

    remaining.textContent = `$${resultRemaining}`;
    remainingBar.textContent = `$${resultRemaining}`;
    totalDiv.append(totalSpan, sumSpan);
  }
}


document.getElementById("export").addEventListener("click", () => {
  const expenses = JSON.parse(localStorage.getItem("expenseData")) || [];

  let csv = "Title,Amount,Category,Date\n";
  expenses.forEach(exp => {
    csv += `${exp.title},${exp.amount},${exp.category},${exp.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();

  URL.revokeObjectURL(url); // cleanup
});

//reset
const btnReset = document.querySelector("#reset-month");
btnReset.addEventListener("click", resetMonth);

function resetMonth() {
  expenseArray = [];

  saveToLocalStorage();
  updateTotal();
  updateProgress();

  
  listExpense.innerHTML = "";
  rightTotal.textContent = "0";
  remaining.textContent = inputSalary.value;
  remainingBar.textContent = inputSalary.value;
 
}



function saveToLocalStorage(){
    localStorage.setItem("expenseData", JSON.stringify(expenseArray));
    localStorage.setItem("userSalary",inputSalary.value);
}

function loadFormLocalStorage() {
    const expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
    const salarySaved = localStorage.getItem("userSalary");
    if (salarySaved){
      inputSalary.value = salarySaved;
    }
    expenseData.forEach(el => {
       addExpense(el);
      expenseArray.push(el);
    });
    updateTotal();
    updateProgress(); 

}

loadFormLocalStorage();

