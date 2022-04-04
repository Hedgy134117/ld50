function increaseScore(score) {
  let currentScore = parseInt(window.localStorage.getItem("taskchampion"));
  window.localStorage.setItem("taskchampion", currentScore + score);

  document.body.querySelector(".score").innerText = `SCORE: ${currentScore}`;
}

class Task {
  constructor(instructions, maxTime) {
    this.dom = null;
    this.instructions = instructions;
    this.instructionsDom = null;
    this.progress = 0;
    this.progressDom = null;
    this.maxTime = maxTime;

    this.constructDom();
    this.startTimer();
  }

  constructDom() {
    this.dom = document.createElement("section");
    this.instructionsDom = document.createElement("p");
    this.instructionsDom.innerText = this.instructions;
    this.dom.append(this.instructionsDom);
    this.progressDom = document.createElement("progress");
    this.updateProgressDom();
    this.dom.append(this.progressDom);
    document.body.append(this.dom);
  }

  updateProgress() {
    this.progress += 0.1
    increaseScore(1);

    if (this.progress > this.maxTime) {
      this.endGame();
    }

    this.updateProgressDom();
  }

  updateProgressDom() {
    this.progressDom.setAttribute("value", this.progress);
    this.progressDom.setAttribute("max", this.maxTime);
    this.dom.style.backgroundColor = `rgba(255, 0, 0, ${this.progress / this.maxTime})`
  }

  startTimer() {
    let timer = this.updateProgress.bind(this)
    setInterval(timer, 100);
  }

  finishedTask() {
    this.progress = 0;
    increaseScore(100);
  }

  penaltyTask() {
    this.progress += 1;
  }

  updateInstructionsDom() {
    this.instructionsDom.innerText = this.instructions;
  }

  endGame() {
    window.location.href = "../score/";
  }
}

class MathTask extends Task {
  constructor(maxTime) {
    super("", maxTime)
    this.generateNums();
    this.answersDom();
  }

  generateNums() {
    this.a = 1 + Math.floor(Math.random() * 50);
    this.b = 1 + Math.floor(Math.random() * 50);
    this.ans = this.a + this.b;
    this.instructions = `What is ${this.a} + ${this.b}?`;
    this.updateInstructionsDom();
  }

  answersDom() {
    let previousAnswers = this.dom.querySelector("div")
    if (previousAnswers != null) {
      previousAnswers.remove();
    }

    let answersContainer = document.createElement("div");
    let correctAnswerIndex = Math.floor(Math.random() * 4);
    for (let i = 0; i < 4; i++) {
      let answer = document.createElement("button");

      if (i == correctAnswerIndex) {
        let func = this.finishedTask.bind(this);
        answer.onclick = func;
        answer.innerText = this.ans;
      }
      else {
        let func = this.penaltyTask.bind(this);
        answer.onclick = func;
        answer.innerText = this.ans + Math.floor((0.5 - Math.random()) * 20);
        while (answer.innerText == this.ans) { // prevent the wrong answer from actually having the right answer
          answer.innerText = this.ans + Math.floor((0.5 - Math.random()) * 20);
        }
      }
      answersContainer.append(answer);
    }
    this.progressDom.insertAdjacentElement("beforebegin", answersContainer);
  }

  finishedTask() {
    super.finishedTask();
    this.generateNums();
    this.answersDom();
  }
}

async function loadSentences() {
  let file = await fetch("./sentences.txt");
  let text = await file.text();
  let sentences = text.split("\r\n");
  TextTask.sentences = sentences;
}

class TextTask extends Task {
  static sentences = null;

  constructor(maxTime) {
    super("Please copy the text into the box below:", maxTime);
    this.generateSentence();
    this.answerDom();
  }

  generateSentence() {
    let previousSentence = this.dom.querySelector("p.sentence");
    if (previousSentence != null) {
      previousSentence.remove();
    }

    this.sentence = TextTask.sentences[Math.floor(Math.random() * TextTask.sentences.length)].toLowerCase();
    let sentenceDom = document.createElement("p");
    sentenceDom.innerText = this.sentence;
    sentenceDom.classList.add("sentence");
    this.progressDom.insertAdjacentElement("beforebegin", sentenceDom);
  }

  answerDom() {
    let previousBox = this.dom.querySelector("input");
    if (previousBox != null) {
      previousBox.remove();
    }

    this.textBox = document.createElement("input")
    this.textBox.setAttribute("type", "text");
    let func = this.checkAnswer.bind(this);
    this.textBox.onkeyup = func;
    this.progressDom.insertAdjacentElement("beforebegin", this.textBox);
  }

  checkAnswer() {
    if (this.sentence == this.textBox.value) {
      this.finishedTask();
    }
  }

  finishedTask() {
    super.finishedTask();
    this.generateSentence();
    this.answerDom();
  }
}

class OrderTask extends Task {
  constructor(maxTime) {
    super("Select the numbers in ASCENDING order", maxTime);
    this.current = 0;
    this.max = 5;
    this.answerDom();
  }

  answerDom() {
    let previousAnswers = this.dom.querySelector("div")
    if (previousAnswers != null) {
      previousAnswers.remove();
    }

    let answersContainer = document.createElement("div");
    this.progressDom.insertAdjacentElement("beforebegin", answersContainer);

    let answers = [];
    for (let i = 0; i < this.max; i++) {
      answers.push(i + 1);
    }

    for (let i = 0; i < this.max; i++) {
      let answerDom = document.createElement("button");
      let index = Math.floor(Math.random() * answers.length)
      let answer = answers[index];
      answers.splice(index, 1);

      let func = this.selectAnswer.bind(this, answer);
      answerDom.onclick = func;
      answerDom.innerText = answer;
      answersContainer.append(answerDom);
    }
  }

  selectAnswer(num) {
    if (num == this.current + 1) {
      this.current = num;
    }
    else {
      this.penaltyTask();
    }

    if (this.current == this.max) {
      this.finishedTask();
    }
  }

  finishedTask() {
    super.finishedTask();
    this.current = 0;
    this.answerDom();
  }
}

class ClickTask extends Task {
  constructor(maxTime) {
    super("", maxTime)
    this.current = 0;
    this.currentDom = null;
    this.max = Math.floor(1 + Math.random() * 10);
    this.instructions = `Press this button ${this.max} times`
    this.updateInstructionsDom();

    this.createClicker();
  }

  createClicker() {
    let previousClicker = this.dom.querySelector("div")
    if (previousClicker != null) {
      previousClicker.remove();
    }

    let clickerContainer = document.createElement("div");
    this.progressDom.insertAdjacentElement("beforebegin", clickerContainer);

    let clicker = document.createElement("button");
    clicker.innerText = "click me :)"
    let func = this.click.bind(this);
    clicker.onclick = func;
    clickerContainer.append(clicker);

    this.currentDom = document.createElement("span");
    this.updateCurrentDom();
    clickerContainer.append(this.currentDom);
  }

  click() {
    this.current++;
    this.updateCurrentDom();

    if (this.current == this.max) {
      this.finishedTask();
    }
  }

  updateCurrentDom() {
    this.currentDom.innerText = `${this.current} / ${this.max}`;
  }

  finishedTask() {
    super.finishedTask();
    this.current = 0;
    this.max = Math.floor(1 + Math.random() * 10);
    this.instructions = `Press this button ${this.max} times`
    this.updateInstructionsDom();
    this.createClicker();
  }
}

const timer = ms => new Promise(res => setTimeout(res, ms))


let hardMode = new URL(document.location).searchParams.get("hard");
window.onload = async () => {
  await loadSentences();
  window.localStorage.setItem("taskchampion", 0);

  let taskTypes = [MathTask, TextTask, OrderTask, ClickTask];
  let tasks = [];
  if (hardMode) {
    document.body.querySelector(".next").innerText = ``;
    for (let i = 0; i < 8; i++) {
      tasks.push(new taskTypes[Math.floor(Math.random() * taskTypes.length)](30));
    }
  }
  else {
    let taskTypesToDel = [MathTask, TextTask, OrderTask, ClickTask];

    let i = 0;
    let last = 0;
    while (i < 8) {
      document.body.querySelector(".next").innerText = `TIME UNTIL NEXT TASK: ${Math.round(Math.exp(i))} SECONDS`;
      await timer(Math.exp(i) * 1000)

      if (taskTypesToDel.length > 0) {
        let index = Math.floor(Math.random() * taskTypesToDel.length)
        tasks.push(new taskTypesToDel[index](30));
        taskTypesToDel.splice(index, 1);
      }
      else {
        let index = Math.floor(Math.random() * taskTypes.length)
        tasks.push(new taskTypes[index](30));
      }

      i++;
    }
  }



}