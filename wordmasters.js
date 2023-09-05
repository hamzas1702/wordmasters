const rows = document.querySelectorAll(".row");
let wordsEntered = 0;
let letterToEnter = 1;
const notEnough = document.querySelector(".notEnough");
const invalidWord = document.querySelector(".invalidWord");
const loader = document.querySelector(".loader");
let winner=document.querySelector(".winner");
let word;
let done=false;
let isLoading = true;
let currentGuess = "";
let map;


function setLoading(isLoading) {
    loader.classList.toggle("hidden", !isLoading)
}

// gettin the word of the day
async function fetchWord() {
    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json()
    word = resObj.word.toUpperCase();
    isLoading = false;
    setLoading(isLoading);
    map=makeMap(word);

}

// frequency map of the word of the day

function makeMap(word) {
    const obj = {};
    for (let i = 0; i < 5; i++) {
        if (obj[word[i]]) {
            obj[word[i]]++;
        }
        else {
            obj[word[i]] = 1;
        }
    }

    return obj;
}

// whether the user is entering a valid word not some gibberish

async function validateWord() {
    isLoading = true;
    setLoading(isLoading);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({ word: currentGuess })
    });
    const { validWord } = await res.json();
    isLoading = false;
    setLoading(isLoading);
    if (validWord) {
        checkGuess();
        wordsEntered++;
        // check if word is correctly guessed
        if(currentGuess===word){
            winner.classList.remove("hidden")
        done=true;
        }
        else if(wordsEntered>=6){
            winner.classList.remove("hidden");
            winner.innerText=word;
            done=true;
        }
        letterToEnter = 1;
        currentGuess = "";
    }
    else {
        invalidWord.classList.remove("hidden")
        invalidWord.classList.add("fade-out");
        rows[wordsEntered].classList.add("shake");
        setTimeout(() => {
            invalidWord.classList.add("hidden");
            rows[wordsEntered].classList.remove("shake");
        }, 1500);
    }

}

// check teh guess for correct wrong and close letter

function checkGuess() {
    let highlight;
    for (let i = 0; i < 5; i++) {
        highlight = i + 1;
        if (currentGuess[i]===word[i]){ 
            rows[wordsEntered].querySelector(".letter-" + highlight).classList.add("correct")
            map[word[i]]--;
            console.log(map[word[2]])
        }
        else if (word.includes(currentGuess[i]) && !(map[currentGuess[i]] < 1) ) {
            rows[wordsEntered].querySelector(".letter-" + highlight).classList.add("close")
        }
        else {
            rows[wordsEntered].querySelector(".letter-" + highlight).classList.add("wrong")
        }
        
        
    }
    map=makeMap(word);
  
}

// cheechkin the pressed key is a letter or not

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}


// when user hits a key on leyboard
function handleKeypress(keypressed) {
    if (keypressed === 'Backspace') {
        removeLetter();
    }
    else if (keypressed === 'Enter') {
        confirm();
    }
    else if (isLetter(keypressed)) {
        addLetter(keypressed);
    }
    else {
        // do notthing
    }
}


function addLetter(keypressed) {
    if (letterToEnter < 6) {
        rows[wordsEntered].querySelector(".letter-" + letterToEnter).innerText = keypressed.toUpperCase();
        letterToEnter++;
        currentGuess = currentGuess + keypressed.toUpperCase();
        console.log(currentGuess);
    }
}

function removeLetter() {
    if (letterToEnter > 1) {
        letterToEnter--;
        rows[wordsEntered].querySelector(".letter-" + letterToEnter).innerText = '';
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    }

}

function confirm() {
    if (letterToEnter < 6) {
        notEnough.classList.remove("hidden");
        notEnough.classList.add("fade-out");
        rows[wordsEntered].classList.add("shake");
        setTimeout(() => {
            notEnough.classList.add("hidden");
            notEnough.classList.remove("fade-out");
            rows[wordsEntered].classList.remove("shake");
        }, 1500);
    }
    else if (letterToEnter = 6) {
        // check the word if it is valid word
        validateWord();
    }
}

document.addEventListener("keydown", function keyPress(event) {

    if(isLoading || done){
        // do nothing
        return
    }

    handleKeypress(event.key);
})

fetchWord();