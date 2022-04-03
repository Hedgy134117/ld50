class Task {
  constructor(instructions) {
    this.dom = null;
    this.instructions = instructions;
    this.instructionsDom = null;
    this.progress = 0;
    this.progressDom = null;
    this.maxTime = 10;

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
    this.updateProgressDom();
  }

  updateProgressDom() {
    this.progressDom.setAttribute("value", this.progress);
    this.progressDom.setAttribute("max", this.maxTime);
  }

  startTimer() {
    let timer = this.updateProgress.bind(this)
    // setInterval(timer, 100)
  }

  finishedTask() {
    this.progress = 0;
  }

  penaltyTask() {
    this.progress += 1;
  }

  updateInstructionsDom() {
    this.instructionsDom.innerText = this.instructions;
  }
}

class MathTask extends Task {
  constructor(instructions) {
    super(instructions)
    this.generateNums();
    this.additionalDom();
  }

  generateNums() {
    this.a = 1 + Math.floor(Math.random() * 50);
    this.b = 1 + Math.floor(Math.random() * 50);
    this.ans = this.a + this.b;
    this.instructions = `What is ${this.a} + ${this.b}?`;
    this.updateInstructionsDom();
  }

  additionalDom() {
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
    this.additionalDom();
  }
}

// let a = new Task();
let b = new MathTask("");