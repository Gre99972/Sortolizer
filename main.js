// Setup Canvas
const canvas = document.getElementById("AlgorithmCanvas");
const ctx = canvas.getContext("2d");

// Note: Change the sorts so that a sort/shuffle cannot start unless the other sort is compelted (exception bogo)


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
numBarsToMake = 200;
shuffling = false;
sortArray = false;
runBogo = false;

// Audio Stuff
const audioCtx = new AudioContext({ sampleRate: 48000});

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

function playBleep(duration, frequency = 1000) {
    const oscNode = new OscillatorNode(audioCtx, {type: "square", frequency: frequency});
    const gainNode = new GainNode(audioCtx, {gain: 0.05});
    oscNode.connect(gainNode).connect(audioCtx.destination);

    oscNode.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    oscNode.start();
    setTimeout(() => oscNode.stop(), duration);
}

async function shuffleBars(fromBogo = false){
    if (!fromBogo) { 
        runBogo = false; 
    }
    shuffling = true;
    for (let index = (barArray.length - 1); index > 0; index--){
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
        playBleep(5, Math.floor(((((barArray[newIndex].value)/(barArray.length) * 100) * 10) + 500)));
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
    shuffling = true;
    arraySorted = false;
    if (runBogo){ runBogo = false;}
    else { runBogo = true;}
    while (!arraySorted && runBogo){
        await shuffleBars(true);
        arraySorted = true;
        for (let index = 0; index < (barArray.length - 1); index++){
            if (barArray[index].value > barArray[index+1].value){
                arraySorted = false;
            }
        }
    }
    runBogo = false;
    shuffling = false;
}

async function bubbleSort(){
    // Bubble sort goes through the array and swaps adjacent elements
    // Complexity: n^2

    let elementSwapped = true;
    let numIterations = 0;
    shuffling = true;
    while (elementSwapped){
        elementSwapped = false;
        numIterations++;
        for (let index = 0; index < barArray.length-numIterations; index++){
            if (barArray[index+1].value < barArray[index].value){
                // Swap the indexes
                let temp = barArray[index+1];
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
            playBleep(5, Math.floor(((((barArray[index].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[index].SetColor(0);
            barArray[index+1].SetColor(0);         
        }

        await drawBars(); 
    }

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function insertionSort(){
    // This sort works by creating a sorted and unsorted array. Each element in the unsorted array is inserted into its correct position in
    // the sorted array until the array is fully sorted
    // Complexity: n^2
    shuffling = true;
    
    for (let unsortedIndex = 1; unsortedIndex < barArray.length; unsortedIndex++){
        let index = unsortedIndex;
        while (barArray[index].value < barArray[index-1].value){
            // Swap the elements
            let temp = barArray[index-1];
            barArray[index-1] = barArray[index];
            barArray[index-1].SetIndex(index-1);
            barArray[index] = temp;
            barArray[index].SetIndex(index);

            barArray[index].SetColor(1);
            barArray[index-1].SetColor(1);
            playBleep(5, Math.floor(((((barArray[index].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[index].SetColor(0);
            barArray[index-1].SetColor(0);
            if (index > 1) { index--; }
            else { break; }
        }
    }

    greenPass();
    shuffling = false;
}


async function selectionSort(){
    // This sort works by swapping adjacent elements in the array
    // Complexity: n^2
    shuffling = true;
    for (let index1 = 0; index1 < barArray.length - 1; index1++){
        for (let index2 = index1 + 1; index2 < barArray.length; index2++){
            // barArray[j] will be after barArray[i] in the array. So if barArray[j] is smaller, they need to be swapped
            if (barArray[index2].value < barArray[index1].value){
                // Swap the indexes
                let temp = barArray[index2];
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
            playBleep(5, Math.floor(((((barArray[index2].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[index1].SetColor(0);
            barArray[index2].SetColor(0); 
        }
    }
    await drawBars();

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function mergeSort(subArray, trueArrayStartIndex){
    if (subArray.length > 1){
        let newArrayLength = Math.floor(subArray.length/2);
        let dividedArray1 = subArray.slice(0, newArrayLength);
        let dividedArray2 = subArray.slice(newArrayLength, subArray.length);
        dividedArray1 = await mergeSort(dividedArray1, trueArrayStartIndex);
        dividedArray2 = await mergeSort(dividedArray2, trueArrayStartIndex + newArrayLength);
        // Sort the two (sorted) arrays
        let dividedArrayIndex1 = 0;
        let dividedArrayIndex2 = 0;

        for (let i = 0; i < subArray.length; i++){
            let tempIndex = subArray[i].index;
            if (dividedArrayIndex1 < dividedArray1.length && dividedArrayIndex2 < dividedArray2.length){
                if (dividedArray1[dividedArrayIndex1].value < dividedArray2[dividedArrayIndex2].value){
                    subArray[i] = dividedArray1[dividedArrayIndex1];
                    subArray[i].index = i + trueArrayStartIndex;
                    dividedArrayIndex1++;
                }
                else {
                    subArray[i] = dividedArray2[dividedArrayIndex2];
                    subArray[i].index = i + trueArrayStartIndex;
                    dividedArrayIndex2++;
                }
            }
            else if (dividedArrayIndex1 < dividedArray1.length){
                subArray[i] = dividedArray1[dividedArrayIndex1];
                subArray[i].index = i + trueArrayStartIndex;
                dividedArrayIndex1++;
            }
            else{
                subArray[i] = dividedArray2[dividedArrayIndex2];
                subArray[i].index = i + trueArrayStartIndex;
                dividedArrayIndex2++;
            }

            subArray[i].SetColor(1);
            playBleep(5, Math.floor(((((barArray[i].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            subArray[i].SetColor(0);
        }
    }

    return subArray
}

async function quickSort(subArray, trueArrayStartIndex){
    // Pivot on the middle element
    pivot = subArray[Math.floor(subArray.length/2)];
    let lessThanArray = [];
    let greaterThanArray = [];
    for (let i = 0; i < subArray.length; i++){
        if (subArray[i].value < pivot.value){
            lessThanArray += subArray[i];
        }
        else{
            greaterThanArray += subArray[i];
        }
    }
    lessThanArray = quickSort(lessThanArray);
    greaterThanArray = quickSort(greaterThanArray);
    subArray = lessThanArray + greaterThanArray;
    return subArray;
}

async function shuffleBarsEntry(){
    if (!shuffling){
        await shuffleBars();
    }
}

async function bubbleSortEntry(){
    if (!shuffling){
        await bubbleSort();
    }
}

async function insertionSortEntry(){
    if (!shuffling){
        await insertionSort();
    }
}

async function selectionSortEntry(){
    if (!shuffling){
        await selectionSort();
    }
}

async function bogoSortEntry(){
    if (!runBogo){
        await bogoSort();
    }
    else{
        runBogo = false;
    }
}

async function decideSortEntry() {
    if (!shuffling){
        shuffling = true;
        await greenPass();
        shuffling = false;
    }
}

async function mergeSortEntry(){
    // This sort works by dividing the list into smaller lists, ordering the smaller lists, then merging the two lists together
    // Complexity: log(n)

    if (!shuffling){
        shuffling = true;
        barArray = await mergeSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function quickSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await quickSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function greenPass(){
    for (let index = 0; index < (barArray.length - 1); index++){
        barArray[index].SetColor(2);
        barArray[index + 1].SetColor(2);
        playBleep(5, Math.floor(((((barArray[index].value)/(barArray.length) * 100) * 10) + 500)));
        await drawBars();
        await sleep(5);
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