var managerNamePlace = document.getElementById('managerName');
var mealRatePlace = document.getElementById('mealRate');
var manageDatePlace = document.getElementById('manageDate');

var serial = document.getElementById('serialNo');
var names = document.getElementById('name');
var deposit = document.getElementById('deposit');
var totalMeal = document.getElementById('totalMeal');
var totalExpense = document.getElementById('totalExpense');
var personCost = document.getElementById('personCost')
var managerRec = document.getElementById('managerRec');
var managerGra = document.getElementById('managerGra');

var serialTaker = document.getElementById('serialTaker');
var nameTaker = document.getElementById('nameTaker');
var depositTaker = document.getElementById('depositTaker');
var mealTaker = document.getElementById('mealTaker');
var expenseTaker = document.getElementById('expenseTaker');

var personTotalPlace = document.getElementById('personTotal');


window.addEventListener("load", (event) => {
    var storedData = JSON.parse(localStorage.getItem('evilID'));
    if (storedData.newData) {
        managerNamePlace.innerHTML = storedData.managerName;
        manageDatePlace.innerHTML = `${storedData.month} of ${storedData.year}`;
        mealRatePlace.innerHTML = '0/-';
    }
    
    if (data.month != storedData.month && data.year != storedData.year) {
        data.push({
            month:storedData.month,
            year:storedData.year,
            manager:storedData.managerName,
            expenseRate:0,
            totalMeal:0,
            mealList: []
        })
    }
    
});


window.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
        document.getElementById("adder").click();
    }else{

    }
    
})

function putData() {

    if (validateInputs()) {
        
        
        names.innerHTML += `
            <span>${nameTaker.value}</span>
        `;
        deposit.innerHTML += `
            <span>${depositTaker.value}/-</span>
        `;
        totalMeal.innerHTML += `
            <span>${mealTaker.value}</span>
        `;
        totalExpense.innerHTML = `
            <b>Total Expense</b>
            <span>${expenseTaker.value}/-</span>
        `;
        

        // if (parseInt(expenseTaker.value) > parseInt(depositTaker.value)) {
        //     let receive = parseInt(expenseTaker.value) - parseInt(depositTaker.value);
        
        //     managerGra.innerHTML += `
        //         <span>00/-</span>
        //     `;
        //     managerRec.innerHTML += `
        //         <span>${receive}/-</span>
        //     `;
        // } else if (parseInt(expenseTaker.value) < parseInt(depositTaker.value)) {
        //     let grant =  parseInt(depositTaker.value) - parseInt(expenseTaker.value);
        
        //     managerGra.innerHTML += `
        //         <span>${grant}/-</span>
        //     `;
        //     managerRec.innerHTML += `
        //         <span>00/-</span>
        //     `;
        // } else 
        // if (parseInt(depositTaker.value) === parseInt(expenseTaker.value)) {
        //     managerGra.innerHTML += `
        //         <span>00/-</span>
        //     `;
        //     managerRec.innerHTML += `
        //         <span>00/-</span>
        //     `;
        // }
        var storedData = JSON.parse(localStorage.getItem('evilID'));
        if (expenseTaker.value != null || expenseTaker.value != "") {
            data[data.length - 1].expenseRate = parseInt(expenseTaker.value);
        }
        data[data.length - 1].mealList.push({
                            no:data[data.length-1].mealList.length,
                            name:nameTaker.value,
                            deposit:parseInt(depositTaker.value),
                            totalMeal:parseInt(mealTaker.value),
                            perCost:0,
        })

        
        console.log(serial.innerHTML);
        console.log(data[data.length-1].mealList.length);

        let totalMealAmmount = 0;

        for (let i = 0; i < data[data.length - 1].mealList.length; i++) {
            totalMealAmmount += data[data.length - 1].mealList[i].totalMeal
        }
        // console.log(totalMealAmmount);
        let mealRateFloat = data[data.length - 1].expenseRate / totalMealAmmount
        mealRatePlace.innerHTML = mealRateFloat.toFixed(2);
        
        let totalMealExpense = mealRateFloat*totalMealAmmount;
        
        // console.log(totalMealExpense);
        
        // let managerRecieve = totalMealExpense - parseInt(mealTaker.value);
        // let managerGives = parseInt(mealTaker.value) - totalMealExpense;

        // console.log(data[data.length - 1].expenseRate);
        // console.log(totalMealAmmount);

        // managerGra.innerHTML += `
        //     <span>${managerGives}</span>
        // `
        // managerRec.innerHTML += `
        //     <span>${managerRecieve}</span>
        // `

        
        managerRec.innerHTML = `
        <b>Manager Recieves</b>
        `
        managerGra.innerHTML = `
        <b>Manager Gives</b>
        `
        serial.innerHTML +=`
            <span>${data[data.length-1].mealList.length}</span>
        `
        personCost.innerHTML = `
            <b>Person Cost</b>
            `
        

        for (let i = 0; i < data[data.length - 1].mealList.length; i++) {
            let personExpense = mealRateFloat * data[data.length-1].mealList[i].totalMeal;

            personCost.innerHTML += `
            <span>${(data[data.length - 1].mealList[i].totalMeal * mealRateFloat).toFixed()}</span>
            `
            data[data.length - 1].mealList[i].perCost = data[data.length - 1].mealList[i].totalMeal * mealRateFloat
            console.log(data[data.length - 1].mealList[i].totalMeal);
            console.log(mealRateFloat);
            let mRes = personExpense.toFixed() - data[data.length-1].mealList[i].deposit;
            if (personExpense.toFixed() - data[data.length-1].mealList[i].deposit < 0) {
                let mRes = 0
                managerRec.innerHTML += `
                <span>${mRes}</span>
            `
            }else{
                managerRec.innerHTML += `
                <span>${mRes}</span>
            `
            }

            let mGive = data[data.length-1].mealList[i].deposit - personExpense.toFixed();
            if (data[data.length-1].mealList[i].deposit - personExpense.toFixed() < 0) {
                let mGive = 0
                managerGra.innerHTML += `
                <span>${mGive}</span>
                `
            }else{
                managerGra.innerHTML += `
                <span>${mGive}</span>
                `
            }
            

            
            
            
        }

        
        nameTaker.value = null
        depositTaker.value = null
        mealTaker.value = null
        let totalPersonCost = 0;
        for (let i = 0; i < data[data.length - 1].mealList.length; i++) {
            totalPersonCost += data[data.length - 1].mealList[i].perCost;
            personTotalPlace.value = totalPersonCost;
            
        }
        
        
        
    }


    
    
}

function validateInputs() {
    if (nameTaker.value === "") {
        let currBor = nameTaker.style.border
        nameTaker.style.border = "solid 2px #ff0000"
        setTimeout(() => {
            nameTaker.style.border = currBor
        }, 200);
        return false;
    }

    if (depositTaker.value === "") {
        let currBor = depositTaker.style.border
        depositTaker.style.border = "solid 2px #ff0000"
        setTimeout(() => {
            depositTaker.style.border = currBor
        }, 200);
        return false;
    }

    if (mealTaker.value === "") {
        let currBor = mealTaker.style.border
        mealTaker.style.border = "solid 2px #ff0000"
        setTimeout(() => {
            mealTaker.style.border = currBor
        }, 200);
        return false;
    }

    if (expenseTaker.value === "") {
        let currBor = expenseTaker.style.border
        expenseTaker.style.border = "solid 2px #ff0000"
        setTimeout(() => {
            expenseTaker.style.border = currBor
        }, 200);
        return false;
    }

    return true;
}

function snap() {
    html2canvas(document.querySelector("#full")).then(canvas => {
        document.body.appendChild(canvas)
    });
}