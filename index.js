// global variable declaration
let count = 0;
let timer;
let quizData = []; // empty array হিসেবে ডিক্লেয়ার করা ভালো
let answers = [];

// Dom elements called
const startQuiz = document.querySelector("#startQuiz");
const rulesContainer = document.querySelector("#rulesContainer");
const alertContainer = document.querySelector("#alertContainer");
const submitContainer = document.querySelector("#submitContainer");
const quizContainer = document.querySelector("#quizContainer");
const answersContainer = document.querySelector("#answersContainer");
const displayResult = document.querySelector("#displayResult");

// EventListener for quiz start button
startQuiz.addEventListener("click", () => {
  let countDown = document.querySelector("#countDownContainer");
  let counter = document.querySelector("#counter");
  let counterNum = 2;
  countDown.classList.remove("hidden");
  countDown.classList.add("flex");

  let x = setInterval(() => {
    if (counterNum < 0) {
      countDown.classList.remove("flex");
      countDown.classList.add("hidden");
      counterNum = 3;
      count = 0;
      timer = null;
      quizData = [];
      answers = [];
      rulesContainer.classList.add("hidden");
      alertContainer.classList.remove("hidden");
      submitContainer.classList.remove("hidden");
      submitContainer.classList.add("flex");
      loadQuiz();
      quizTimer();
      clearInterval(x);
    }
    counter.innerText = counterNum;
    counterNum--;
  }, 1000);
});

// JSON data fetch করার ফাংশন
const loadQuiz = async () => {
  try {
    const res = await fetch("quiz.json");
    if (!res.ok) throw new Error("JSON file not found!");
    const data = await res.json(); 
    quizData = data;
    displayQuiz(data);
  } catch (err) {
    console.error("Data load logic check:", err);
    quizContainer.innerHTML = `<p class="text-red-500 text-center">Failed to load quiz data. Please check quiz.json file.</p>`;
  }
};

// UI-তে কুইজ দেখানোর ফাংশন
const displayQuiz = (data) => {
  if (!data) {
    quizContainer.innerHTML = "";
    return;
  }

  quizContainer.innerHTML = ""; // আগের ডাটা ক্লিয়ার করা
  data.forEach((quiz, i) => {
    quizContainer.innerHTML += `<div class="m-3 py-3 px-4 shadow-sm rounded border border-gray-100 bg-white">
      <div class="flex items-center">
        <div class="h-8 w-8 bg-green-300 rounded-full flex justify-center items-center text-green-800 mr-3">
          ${i + 1}
        </div>
        <p class="text-gray-800 text-sm font-medium">${quiz.question}</p>
      </div>
      <div class="grid grid-cols-2 gap-4 mt-5">
        ${displayQuizOptions(quiz.options, i)}
      </div>
    </div>`;
  });
};

// Submit বাটনের EventListener
document.querySelector("#submit").addEventListener("click", () => {
  // আপনার কন্ডিশন অনুযায়ী কমপক্ষে ৬টি উত্তর দিতে হবে
  if (answers.length < 6) {
    alert("Please answer at least 6 questions!");
    return;
  }

  quizTimer(true); // টাইমার বন্ধ করা
  
  // চেক করার সময় লোডিং এনিমেশন
  answersContainer.innerHTML = `<div class="my-4 text-center">
    <i class="fa-solid fa-fan animate-spin text-2xl text-green-600"></i>
    <p class="text-xs animate-pulse">Please Wait, We are checking...</p>
  </div>`;

  let timeTaken = document.querySelector("#count");
  let totalMark = 0;
  let grade = { status: "", color: "" };

  // মার্ক ক্যালকুলেশন
  for (let ans of answers) {
    if (ans.answer === ans.givenAns) {
      totalMark += 10;
    }
  }

  // গ্রেড নির্ধারণ
  if (totalMark === 60) {
    grade.status = "Excellent";
    grade.color = "text-green-600";
  } else if (totalMark >= 40) {
    grade.status = "Good";
    grade.color = "text-orange-600";
  } else {
    grade.status = "Poor";
    grade.color = "text-red-600";
  }

  // Local Storage-এ রেজাল্ট সেভ করা
  let storage = JSON.parse(localStorage.getItem("results")); 
  let currentResult = {
    marks: totalMark,
    examTime: timeTaken.innerText,
    status: grade.status,
  };

  if (storage) {
    localStorage.setItem("results", JSON.stringify([...storage, currentResult]));
  } else {
    localStorage.setItem("results", JSON.stringify([currentResult]));
  }

  // রেজাল্ট দেখানোর জন্য অল্প সময় অপেক্ষা (এনিমেশন ফিল দেওয়ার জন্য)
  let x = setTimeout(() => {
    showAnswers(answers);
    
    // আবার নতুন করে স্টোরেজ ডাটা নিয়ে আসা UI আপডেট করার জন্য
    let updatedStorage = JSON.parse(localStorage.getItem("results"));

    displayResult.innerHTML = `
    <div class="h-[220px] w-[220px] mx-auto mt-8 flex flex-col justify-center border-2 rounded-tr-[50%] rounded-bl-[50%]">
      <h3 class="text-xl ${grade.color}">${grade.status}</h3>
      <h1 class="text-3xl font-bold my-2">
        ${totalMark}<span class="text-slate-800">/60</span>
      </h1>
      <p class="text-sm flex justify-center items-center gap-2">
        Total Time: <span class="text-xl text-orange-500">${timeTaken.innerText.replace("sec", "")}<span class="text-xs">sec</span></span>
      </p>
    </div>
    
    <button onclick="location.reload();" class="bg-green-600 text-white w-full py-2 rounded mt-16 hover:bg-green-700 transition">Restart</button>
    
    ${updatedStorage ? `
      <div class="mt-8">
        <h1 class="text-center font-bold">Previous Submissions 
          <button class="text-blue-800 text-xs ml-2 underline" onclick="localStorage.clear();location.reload();">Clear History</button>
        </h1>
        <div class="flex justify-between items-center border rounded p-2 my-2 shadow-sm font-medium bg-gray-50">
          <div>Marks</div>
          <div>Grade</div>
          <div>Time</div>
        </div>
        ${updatedStorage.reverse().map((item) => `
          <div class="flex justify-between items-center border rounded p-2 my-2 shadow-sm text-sm">
            <div>${item.marks}/60</div>
            <div>${item.status}</div>
            <div>${item.examTime}</div>
          </div>
        `).join("")}
      </div>` : ""
    }
    `;

    clearTimeout(x);
  }, 1500);

  window.scrollTo(0, 0);
});
