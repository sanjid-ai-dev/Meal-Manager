var cleanMonth;
var cleanYear;
var cleanManagerName;



var walkScene = [
    {
        scene : `
    <img src="./assets/undraw_online_calendar_re_wk3t.svg" alt="">

    <h1>
        Insert Month and Year
    </h1>

    <div class="valider-a">
        <div class="">
            <label for="month">
                Month :
            </label>
            <br>
            <select name="month" id="month">
                <option value=""></option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
            </select>                    
        </div>
        <div class="">
            <label for="year">
                Year :
            </label>
            <br>
            <input type="number" min="1900" max="2099" step="1" onChange="yearVal()" id="year" name="year"/>
        </div>
    </div>

    <div class="valA">
    <button class="valider-a-butt" onclick="validateDate()">
    Next
</button>
<button class="valider-a-butt skip" onclick="window.location.href = 'chart.html'">
    Skip
</button>
    </div>

    `
}
    ,
    {
        scene:`
        <img src="/assets/undraw_fashion_blogging_re_fhi5.svg" alt="">
    
                <h1>
                    What&rsquo;s the managers name?
                </h1>
    
                <div class="valider-a">
                    <div class="inputter">
                        <input type="text" name="managerInp" id="managerInp" placeholder="Manager's Name">
                    </div>
                </div>
    
                <button class="valider-a-butt" onclick="validateB()">
                    Next
                </button>
        `
    }
]

var walkBody = document.getElementById('walkthrough-body');
var walkPos = document.getElementById('metabody').getAttribute('data-walkposition');

function setScene() {
        walkBody.innerHTML = walkScene[walkPos].scene
        document.getElementsByClassName('wt')[0].classList.add("active")
        // document.getElementsByClassName('wtline')[0].classList.add("active")

}
var wtlength = 1;

function changeScene() {
    if (parseInt(walkPos) < walkScene.length-1) {
        
        walkPos = parseInt(walkPos)+1;
        // console.log(walkPos +" ... "+ walkScene.length);
        
    }else {
        walkBody.style.display = 'none'
        document.getElementById('Tutorial').style.display = 'block'
        
    }

    document.getElementById('metabody').setAttribute('data-walkposition',walkPos)

    setScene();

    document.getElementsByClassName('wt')[parseInt(wtlength)].classList.add("active")
    document.getElementsByClassName('wtline')[parseInt(wtlength)-1].classList.add("active")
    wtlength = wtlength + 1;

    // secondValidation();
    
}

function validateDate() {
    document.getElementById('month')

    if (document.getElementById('month').value == "" && document.getElementById('year').value == "") {
        if (document.getElementById('year').value == "") {
            let currDate = new Date();
            document.getElementById('year').value = currDate.getFullYear()

        }
    }else if(document.getElementById('month').value == ""){
        let currBor = document.getElementById('month').style.border
        document.getElementById('month').style.border = "solid 2px #ff0000"
        setTimeout(() => {
            document.getElementById('month').style.border = currBor
        }, 100);
    } else if (document.getElementById('year').value == "") {
        let currDate = new Date();
            document.getElementById('year').value = currDate.getFullYear()
    }else{
        cleanMonth = document.getElementById('month').value
        cleanYear = document.getElementById('year').value
        changeScene();
    }

    
}
function yearVal() {
    if (document.getElementById('year').value < 1900){
        document.getElementById('year').value = 1900
    }else if( document.getElementById('year').value > 2900){
        document.getElementById('year').value = 2999
    }
    
}


window.addEventListener("load", (event) => {
    setScene()

});


// function secondValidation() {
    

    
// }

function validateB() {
    var mgNm = document.getElementById('managerInp')
    if (mgNm.value == "") {
        let currBor = mgNm.style.border
        mgNm.style.border = "solid 2px #ff0000"
        setTimeout(() => {
            mgNm.style.border = currBor
        }, 100);
    } else {
        cleanManagerName = mgNm.value;
        changeScene()
    }
}

function chartCreate (){
    for (let i = 0; i < data.length; i++) {
        if (data[i].year != cleanYear) {
            if (data[i].month != cleanMonth) {
                localStorage.setItem('evilID', JSON.stringify({
                    managerName: cleanManagerName,
                    month: cleanMonth,
                    year: cleanYear,
                    newData: true
                }));
                window.location.href = 'chart.html'
                console.log(11111);
            }
        }
        
    }
    if (data.length == 0) {
        localStorage.setItem('evilID', JSON.stringify({
            managerName: cleanManagerName,
            month: cleanMonth,
            year: cleanYear,
            newData: true
        }));
        
        // console.log(22222);
        // var storedData = JSON.parse(localStorage.getItem('evilID'));
        // var totl = storedData.managerName;
        // console.log(totl);

        window.location.href = 'chart.html'
        
    }
    
}

