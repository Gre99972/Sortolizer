// Setup Canvas
const canvas = document.getElementById("AlgorithmCanvas");
const ctx = canvas.getContext("2d");

// Class for the bar
class SortBar {
    width = 50;
    height = 100;
    value = 10;
    index = 0;
    color = 0;

    constructor(inputIndex, inputValue, inputWidth, inputHeight){
        this.index = inputIndex;
        this.value = inputValue;
        this.width = inputWidth;
        this.height = inputHeight;
    }

    Draw(){
        // Decide on the colour to fill the bar with
        if (this.color === 0){ ctx.fillStyle = "white"; }
        else if (this.color === 1) { ctx.fillStyle = "red"; }
        else if (this.color === 2) { ctx.fillStyle = "green"; }
        else if (this.color === 3) { ctx.fillStyle = "blue"; }
        else { ctx.fillStyle = "white"; }

        ctx.fillRect((this.index * (this.width + 1)),(canvas.height - this.height),this.width,this.height);
    }

    SetWidth(newWidth) { this.width = newWidth; }
    SetHeight(newHeight) { this.height = newHeight; }
    SetValue(newValue) { this.value = newValue; }
    SetIndex(newIndex) { this.index = newIndex; }
    SetColor(newColor) { this.color = newColor; }
}

barArray = [];
numBarsToMake = 100;
shuffling = false;
sortArray = false;

// Audio Stuff
const audioCtx = new AudioContext();

// Main program
function drawBars(){
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw the bars
    for (i = 0; i < barArray.length; i++){
        barArray[i].Draw();
    }
}

function createBars(){
    for (i = 0; i < numBarsToMake; i++){
        barArray[i] = new SortBar(i, i, (canvas.width/numBarsToMake) - 1, (canvas.height * (i + 1))/numBarsToMake);
    }
}

function adjustBarSize(){
    for (i = 0; i < numBarsToMake; i++){
        barArray[i].SetHeight((canvas.height / (numBarsToMake + 1)) * (barArray[i].value + 1));
        barArray[i].SetWidth((canvas.width/numBarsToMake) - 1);
    }
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function playBleep(duration = 100, frequency = 1000) {
    const oscNode = new OscillatorNode(audioCtx, {type: "triangle", frequency: frequency});
    const gainNode = new GainNode(audioCtx, {gain: 0.5});
    oscNode.connect(gainNode).connect(audioCtx.destination);

    oscNode.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscNode.start();
    setTimeout(() => oscNode.stop(), duration);
}

async function shuffleBars(fromBogo = false){
    if (!fromBogo) { runBogo = false; }
    shuffling = true;
    for (index = (barArray.length - 1); index > 0; index--){
        // Find a random index past i (or i)
        newIndex = Math.floor(Math.random() * i);
        
        // Swap the indexes
        temp = barArray[newIndex];
        barArray[newIndex] = barArray[index];
        barArray[newIndex].SetIndex(newIndex);
        barArray[index] = temp;
        barArray[index].SetIndex(index);

        // Changes colour of the bars, draws them, waits, then continues (resets the colour of bars as well)
        barArray[index].SetColor(1);
        barArray[newIndex].SetColor(1);
        drawBars();  
        playBleep(5, Math.floor(((barArray[newIndex].value * 10) + 500)));
        await sleep(5);
        barArray[index].SetColor(0);
        barArray[newIndex].SetColor(0);
    }
    shuffling = false;
    drawBars();
}

async function bogoSort(){
    arraySorted = false;
    runBogo = true;
    while (!arraySorted && runBogo){
        await shuffleBars(true);
        arraySorted = true;
        for (index = 0; index < (barArray.length - 1); index++){
            if (barArray[index].value > barArray[index+1].value){
                arraySorted = false;
            }
        }
    }
    runBogo = false;
}

/*function bubbleSort(){
    // Bubble sort works by swapping adjacent elements in the array
    for (i = 0; i < barArray.length; i++){
        for (j = i; j < barArray.length; j++){
            // barArray[j] will be after barArray[i] in the array. So if barArray[j] is smaller, they need to be swapped
            if (barArray[j].value < barArray[i].value){
                // Swap the indexes
                temp = barArray[j];
                barArray[j] = barArray[i];
                barArray[j].SetIndex(j);
                barArray[i] = temp;
                barArray[i].SetIndex(i);
            }
        }
    }
}*/

createBars();

// Resizes the canvas when the window is resized
window.onload = window.onresize = function() {
    var canvas = document.getElementById("AlgorithmCanvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
    adjustBarSize();
    drawBars();
}