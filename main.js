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
runBogo = false;

// Audio Stuff
const audioCtx = new AudioContext();

// Main program
async function drawBars(){
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
    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;

    if (!fromBogo) { 
        runBogo = false; 
        doSort = false; 
    }
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
        await drawBars();  
        playBleep(5, Math.floor(((barArray[newIndex].value * 10) + 500)));
        if (!shuffling){
            break;
        }
        await sleep(5);
        barArray[index].SetColor(0);
        barArray[newIndex].SetColor(0);
    }
    shuffling = false;
    await drawBars();
}

async function bogoSort(){
    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;

    arraySorted = false;
    if (runBogo){ runBogo = false;}
    else { runBogo = true; doSort = true; }
    while (!arraySorted && runBogo){
        await shuffleBars(true);
        arraySorted = true;
        for (index = 0; index < (barArray.length - 1); index++){
            if (barArray[index].value > barArray[index+1].value){
                arraySorted = false;
            }
        }
        if (!doSort){
            break;
        }
    }
    runBogo = false;
}

async function bubbleSort(){
    // Bubble sort goes through the array and swaps adjacent elements
    // Complexity: n^2

    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;

    elementSwapped = true;
    numIterations = 0;
    while (elementSwapped && doSort){
        elementSwapped = false;
        numIterations++;
        for (index = 0; index < barArray.length-numIterations; index++){
            if (barArray[index+1].value < barArray[index].value){
                // Swap the indexes
                temp = barArray[index+1];
                barArray[index+1] = barArray[index];
                barArray[index+1].SetIndex(index+1);
                barArray[index] = temp;
                barArray[index].SetIndex(index);

                barArray[index].SetColor(1);
                barArray[index+1].SetColor(1);
                elementSwapped = true;
            }
            else {
                barArray[index].SetColor(2);
                barArray[index+1].SetColor(2);  
            }
            playBleep(5, Math.floor(((barArray[index+1].value * 10) + 500)));
            await drawBars();
            if (!doSort){
                break;
            }   
            await sleep(5);
            barArray[index].SetColor(0);
            barArray[index+1].SetColor(0);         
        }

        await drawBars(); 
    }

    // Do the green pass
    if (doSort){
        greenPass();
    }
}

async function insertionSort(){
    // This sort works by creating a sorted and unsorted array. Each element in the unsorted array is inserted into its correct position in
    // the sorted array until the array is fully sorted
    // Complexity: n^2
    
    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;
    
    for (unsortedIndex = 1; unsortedIndex < barArray.length; unsortedIndex++){
        index = unsortedIndex;
        while (barArray[index].value < barArray[index-1].value){
            // Swap the elements
            temp = barArray[index-1];
            barArray[index-1] = barArray[index];
            barArray[index-1].SetIndex(index-1);
            barArray[index] = temp;
            barArray[index].SetIndex(index);

            barArray[index].SetColor(1);
            barArray[index-1].SetColor(1);
            await drawBars();
            await sleep(5);
            barArray[index].SetColor(0);
            barArray[index-1].SetColor(0);
            if (!doSort){
                break;
            }

            if (index > 1) { index--; }
            else { break; }
        }
        if (!doSort){
            break;
        }
    }

    if (doSort){
        greenPass();
    }
}

async function mergeSort(){
    // This sort works by dividing the list into smaller lists, ordering the smaller lists, then merging the two lists together
    // Complexity: log(n)

    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;


}


async function selectionSort(){
    // This sort works by swapping adjacent elements in the array
    // Complexity: n^2

    // Ensures that the algorithm is not being sorted already by another algorithm. Or that it's not being shuffled
    doSort = false;
    shuffling = false;
    await sleep(50);
    doSort = true;

    for (index1 = 0; index1 < barArray.length - 1; index1++){
        for (index2 = index1 + 1; index2 < barArray.length; index2++){
            // barArray[j] will be after barArray[i] in the array. So if barArray[j] is smaller, they need to be swapped
            if (barArray[index2].value < barArray[index1].value){
                // Swap the indexes
                temp = barArray[index2];
                barArray[index2] = barArray[index1];
                barArray[index2].SetIndex(index2);
                barArray[index1] = temp;
                barArray[index1].SetIndex(index1);

                barArray[index1].SetColor(1);
                barArray[index2].SetColor(1);
            }
            else{
                barArray[index1].SetColor(2);
                barArray[index2].SetColor(2);       
            }
            playBleep(5, Math.floor(((barArray[index2].value * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[index1].SetColor(0);
            barArray[index2].SetColor(0);
            if (!doSort){
                break;
            }    
        }
        if (!doSort){
            break;
        }
    }
    await drawBars();

    // Do the green pass
    if (doSort){
        greenPass();
    }
}

async function greenPass(){
    for (index = 0; index < (barArray.length - 1); index++){
        if (barArray[index].value > barArray[index+1].value){
            arraySorted = false;
        }
        else{
            barArray[index].SetColor(2);
            barArray[index + 1].SetColor(2);
            playBleep(5, Math.floor(((barArray[index].value * 10) + 500)));
            await drawBars();
            await sleep(5);
        }
        if (!doSort){
            break;
        }
    }
    await drawBars();   
}

createBars();

// Resizes the canvas when the window is resized
window.onload = window.onresize = function() {
    var canvas = document.getElementById("AlgorithmCanvas");
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.7;
    adjustBarSize();
    drawBars();     
}