import { quizQuestions } from "./module.js";
//console.log(quizQuestions); just wanted to confirm that the module worked

//import all my html el using DOM
const htmlQuestion = document.getElementById("htmlQuestion");
const h1Elem = document.getElementById("h1Elem");

const resetQuizBtn = document.getElementById("resetQuizBtn");
const buttonHTML = document.getElementById("buttonHTML");
const apiQuizBtn = document.getElementById("apiQuizBtn");
const localQuizBtn = document.getElementById("localQuizBtn");
const sportsNextBtn = document.getElementById("sportsNextBtn");

const startContainer = document.getElementById("startContainer");
const quizContainer = document.getElementById("quizContainer");

let currentQuestionIndex = 0;
let sportsQuizScore = 0;
let questions = [];
let usedQuestions = [];

// Funktion för att hämta en slumpmässig fråga som inte har använts. 
function randomQuestion() {
    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * questions.length);
    } while (usedQuestions.includes(randomIndex) && usedQuestions.length < questions.length);

    // Lägg till indexet i usedQuestions för att hålla koll på vilka som använts
    usedQuestions.push(randomIndex);

    return questions[randomIndex];
}

//here is my function for either selecting my api-quiz or local quiz
async function sportsQuiz(useLocalQuestions = false) {
    try {
        usedQuestions = []; // Återställ använda frågor vid quizets start
        sportsQuizScore = 0; //Reset score
        currentQuestionIndex = 0; //display current index(score)

        if (useLocalQuestions) {
            // Använd lokala quizet
            questions = quizQuestions;
            startContainer.style.display = "none";  // hide start buttons
            quizContainer.style.display = "block";  // show quizContainer
            showSQuestion();  // show first question from local quiz
        } else {
            // Hämta frågor från API
            let response = await fetch('https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple');
            let data = await response.json();
            questions = data.results.map(q => ({
                question: q.question,
                options: [...q.incorrect_answers, q.correct_answer],
                correctAnswer: q.correct_answer
            }));
            startContainer.style.display = "none";  // hide startbuttons
            quizContainer.style.display = "block";  // show quizContainer
            showSQuestion();  // show first question from api quiz
        }
    } catch (error) {
        console.error(`error: ${error}`);
    }
}

// function to show relevant question on sportsquiz (API) 
function showSQuestion() {
    if (usedQuestions.length < questions.length) {
        const currentQuestion = randomQuestion();  // get a random question
        htmlQuestion.innerHTML = `${currentQuestion.question}`;
        ;

        //mix alternatives, had issues with the answers always being on the last option. this resolved that.
        const options = [...currentQuestion.options];
        options.sort(() => Math.random() - 0.5);

        // clear buttons
        buttonHTML.innerHTML = "";

        // create buttons for each alternative
        options.forEach(option => {
            const newButton = document.createElement("button");
            newButton.innerHTML = option;
            newButton.classList.add("quizHolderBtn");
            buttonHTML.appendChild(newButton);

            // Lägg till event listener för att hantera val
            newButton.addEventListener('click', () => selectedOptions(option, currentQuestion.correctAnswer));
        });

        // Dölj "Next"-knappen t.om att ett svar har valts och h1Elem för att ta bort min text på H1.
        h1Elem.style.display = "none";
        sportsNextBtn.style.display = "none";
    } else {
        showResults();  // Visa resultat om inga fler frågor finns
    }
}

// function to deal with correct and IF correct, increase score by +1
function selectedOptions(selected, correct) {
    const isCorrect = selected === correct;
    if (isCorrect) {
        sportsQuizScore++;  // increase score if correct
    }

    // Visa rätt/fel svar på knapparna
    const optionButtons = buttonHTML.querySelectorAll("button");
    optionButtons.forEach(button => {
        if (button.innerHTML === correct) {
            button.classList.add("correct");  // CORRECT will be displayed IF correct
        } else {
            button.classList.add("incorrect");  // WRONG will be displayed IF wrong
        }
        button.disabled = true;  // de-activates all buttons after answer, either wrong or true.
    });

    //show next button after answer has been displayed
    sportsNextBtn.style.display = "block";
}

//function to handle next question, i.e go forward in the quiz
function handleNextBtn() {
    if (usedQuestions.length < questions.length) {
        showSQuestion();  //show next random question
    } else {
        showResults();  //display result IF all questions answered. i.e show result when quiz is finished
    }
    sportsNextBtn.style.display = "none";  //hide next button until question is answered.
}

//event listeners for nextbutton
sportsNextBtn.addEventListener('click', () => {
    handleNextBtn();  //Go to next question/show result
});

// Funktion för att visa resultat när quizet är klart
function showResults() {
    htmlQuestion.innerHTML = `Quiz finished! Your score is: ${sportsQuizScore}/${questions.length}!`;
    buttonHTML.innerHTML = "";  //clear buttons
    sportsNextBtn.style.display = "none";  //hide next button
    resetQuizBtn.style.display = "block";
}

//event listener for choosing local quiz
//using DOM to get my pElement and to write out which quiz user has selected. in this case the "football quiz"
localQuizBtn.addEventListener('click', () => {
    document.getElementById("pElem").textContent = "Football Quiz";
    sportsQuiz(true); // lokala quizet

});
//using DOM to get my pElement and to write out which quiz user has selected. in this case the "API quiz"
apiQuizBtn.addEventListener('click', () => {
    document.getElementById("pElem").textContent = "Randomized Quiz";
    sportsQuiz(false);  //api questions
});

resetQuizBtn.addEventListener('click', resetQuiz);
function resetQuiz() {
    let currentQuestionIndex = 0;
    let sportsQuizScore = 0;
    location.reload();

    startContainer.style.display = "block";
    quizContainer.style.display = "none";
    resetQuizBtn.style.display = "none";
    sportsNextBtn.style.display = "none";
}

