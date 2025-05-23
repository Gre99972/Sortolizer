// Setup Canvas
const canvas = document.getElementById("AlgorithmCanvas");
const ctx = canvas.getContext("2d");

// Setup Variables
barArray = [];
numBarsToMake = 50;
circleCentreX = Math.round(canvas.width/2);
circleCentreY = Math.round(canvas.height/2);
minBarHeight = 50;
maxBarHeight = 500;
drawStyle = "rectangle";
shuffling = false;
sortArray = false;
runBogo = false;

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
        // Let's try to change this so that we draw it in a circle
        if (drawStyle === "rectangle"){
            if (this.color === 0){ ctx.fillStyle = "white"; }
            else if (this.color === 1) { ctx.fillStyle = "red"; }
            else if (this.color === 2) { ctx.fillStyle = "green"; }
            else if (this.color === 3) { ctx.fillStyle = "blue"; }
            else { ctx.fillStyle = "white"; }

            ctx.fillRect((this.index * (this.width + 1)),(canvas.height - this.height),this.width,this.height);
        }
        else if (drawStyle == "circle"){
            // Implement code to draw bars as sectors of a circle instead of bars in a row (little more fun and unique)
            
        }
    }

    SetWidth(newWidth) { this.width = newWidth; }
    SetHeight(newHeight) { this.height = newHeight; }
    SetValue(newValue) { this.value = newValue; }
    SetIndex(newIndex) { this.index = newIndex; }
    SetColor(newColor) { this.color = newColor; }
}

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
        newIndex = Math.floor(Math.random() * index);
        
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
    if (arraySorted){
        greenPass();
    }
    runBogo = false;
    shuffling = false;
}

async function bubbleSort(){

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

async function saltShakerSort(){

    let elementSwapped = true;
    let numIterations = 0;
    shuffling = true;
    while (elementSwapped){
        elementSwapped = false;
        numIterations++;
        if (numIterations % 2 == 1){
            for (let index = Math.floor(numIterations/2); index < barArray.length-Math.floor(numIterations/2) - 1; index++){
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
        }
        else{
            for (let index = barArray.length-Math.floor(numIterations/2) - 1; index > Math.floor(numIterations/2)-1; index--){
                if (barArray[index-1].value > barArray[index].value){
                    // Swap the indexes
                    let temp = barArray[index-1];
                    barArray[index-1] = barArray[index];
                    barArray[index-1].SetIndex(index-1);
                    barArray[index] = temp;
                    barArray[index].SetIndex(index);

                    barArray[index].SetColor(1);
                    barArray[index-1].SetColor(1);
                    elementSwapped = true;
                }
                else {
                    barArray[index].SetColor(2);
                    barArray[index-1].SetColor(2);  
                }
                playBleep(5, Math.floor(((((barArray[index].value)/(barArray.length) * 100) * 10) + 500)));
                await drawBars();
                await sleep(5);
                barArray[index].SetColor(0);
                barArray[index-1].SetColor(0); 
                barArray[index+1].SetColor(0);         
            }        
        }

        await drawBars(); 
    }

    // Do the green pass
    greenPass();
    shuffling = false;
}

async function gnomeSort(){
    shuffling = true;
    let i = 0;
    while (i < barArray.length - 1){
        if (barArray[i].value > barArray[i+1].value){
            // Swap indexes
            let temp = barArray[i+1];
            barArray[i+1] = barArray[i];
            barArray[i+1].SetIndex(i+1);
            barArray[i] = temp;
            barArray[i].SetIndex(i);

            barArray[i].SetColor(3);
            barArray[i+1].SetColor(1);
            playBleep(5, Math.floor(((((barArray[i].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[i].SetColor(0);
            barArray[i+1].SetColor(0);
            // Move back one
            if (i > 0){
                i--;
                barArray[i].SetColor(3);
                barArray[i+1].SetColor(2);
                playBleep(5, Math.floor(((((barArray[i].value)/(barArray.length) * 100) * 10) + 500)));
                await drawBars();
                await sleep(5);
                barArray[i].SetColor(0);
                barArray[i+1].SetColor(0);
            }
        }
        else{
            i++;
        }
    }
    shuffling = false;
    greenPass();

}

async function combSort() {
    shuffling = true;

    let elementSwapped = true;
    let gapSize = barArray.length;
    shuffling = true;
    while (elementSwapped){
        gapSize = gapSize/1.3;
        let gap = Math.floor(gapSize);
        elementSwapped = false;
        for (let index = 0; index < barArray.length-gap; index++){
            if (barArray[index+gap].value < barArray[index].value){
                // Swap the indexes
                let temp = barArray[index+gap];
                barArray[index+gap] = barArray[index];
                barArray[index+gap].SetIndex(index+gap);
                barArray[index] = temp;
                barArray[index].SetIndex(index);

                barArray[index].SetColor(1);
                barArray[index+gap].SetColor(1);
                elementSwapped = true;
            }
            else {
                barArray[index].SetColor(2);
                barArray[index+gap].SetColor(2);  
            }
            playBleep(5, Math.floor(((((barArray[index].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[index].SetColor(0);
            barArray[index+gap].SetColor(0);         
        }

        await drawBars(); 
    }    


    greenPass();
    shuffling = false;
}

async function reverseBarSubArray(endIndex){
    // Part of pancake sort
    for (let i = 0; i < Math.round(endIndex/2); i++){
        let temp = barArray[endIndex-i];
        barArray[endIndex-i] = barArray[i];
        barArray[endIndex-i].SetIndex(endIndex-i);
        barArray[i] = temp;
        barArray[i].SetIndex(i);

        /*barArray[i].SetColor(1);
        barArray[endIndex-i].SetColor(1);
        playBleep(5, Math.floor(((((barArray[i].value)/(barArray.length) * 100) * 10) + 500)));
        await drawBars();
        await sleep(5);
        barArray[i].SetColor(0);
        barArray[endIndex-i].SetColor(0);*/       
    }
    playBleep(20, Math.floor(((((barArray[endIndex].value)/(barArray.length) * 100) * 10) + 500)));
    await drawBars();
    await sleep(350);
}

async function pancakeSort(){
    shuffling = true;
    // Like selection, we find the next element we need. We then flip that element so it's the first element in the list
    // We then flip the whole unsorted portion so that the next element that we need is in the correct position in the array
    let numSortedElements = 0;
    while (numSortedElements < barArray.length){
        let nextElementToSort = 0;
        // Find the element we want to flip (greatest element in unsorted array)
        for (let i = 0; i < barArray.length-numSortedElements; i++){
            if (barArray[i].value > barArray[nextElementToSort].value){
                nextElementToSort = i;
            }
            barArray[i].SetColor(1);
            playBleep(5, Math.floor(((((barArray[i].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            barArray[i].SetColor(0);
        }
        if (nextElementToSort != 0){
            await reverseBarSubArray(nextElementToSort);
        }
        await reverseBarSubArray(barArray.length - numSortedElements - 1);
        numSortedElements++;
    }

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
    if (subArray.length > 1){
        // Pivot on the middle element
        pivot = subArray[Math.floor(Math.random() * subArray.length)];
        pivot.SetColor(3);
        let lessThanArray = [];
        let greaterThanArray = [];
        // Actually Sort the array...
        for (let i = 0; i < subArray.length; i++){
            if (subArray[i].value < pivot.value){
                lessThanArray.push(subArray[i]);
            }
            else{
                greaterThanArray.push(subArray[i]);
            }
        }

        // Rerun through to do the animatic (we need to know how many elements are on each side to draw it... :( ))
        for (let i = 0; i < lessThanArray.length; i++){
            lessThanArray[i].index = trueArrayStartIndex + i;
            lessThanArray[i].SetColor(1);
            playBleep(5, Math.floor(((((lessThanArray[i].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            lessThanArray[i].SetColor(0);
        }
        for (let i = 0; i < greaterThanArray.length; i++){
            greaterThanArray[i].index = trueArrayStartIndex + lessThanArray.length + i;
            greaterThanArray[i].SetColor(1);
            playBleep(5, Math.floor(((((greaterThanArray[i].value)/(barArray.length) * 100) * 10) + 500)));
            await drawBars();
            await sleep(5);
            greaterThanArray[i].SetColor(0);
        }
                
        // Continue to pivot and split until we reach an array with only one element
        lessThanArray = await quickSort(lessThanArray, trueArrayStartIndex);
        greaterThanArray = await quickSort(greaterThanArray, trueArrayStartIndex + lessThanArray.length);

        // Reconstruct a sorted subarray to return to the caller
        subArray = lessThanArray.concat(greaterThanArray);
    }
    return subArray;
}

// Functions required for Heap Sort

async function heapSort(arrayToSort){
    virtualArrayLength = (arrayToSort.length - 1);
    arrayToSort = await buildMaxHeap(arrayToSort);
    for (let i = (arrayToSort.length - 1); i >= 0; i--){
        // Swap arrayToSort[0] and arrayToSort[i]
        arrayToSort = await swapIndexes(arrayToSort, 0, i);
        virtualArrayLength = virtualArrayLength - 1;
        arrayToSort = await heapify(arrayToSort, 0);
    }

    return arrayToSort;
}

async function buildMaxHeap(arrayToSort){
    for (let i = Math.floor(virtualArrayLength / 2); i >= 0; i--){
        arrayToSort = await heapify(arrayToSort, i);
    }
    return arrayToSort;
}

async function heapify(arrayToSort, i){
    let leftElement = 2 * i + 1;
    let rightElement = 2 * i + 2;
    let maxElement = 0;

    if (leftElement < virtualArrayLength && arrayToSort[leftElement].value > arrayToSort[i].value){
        maxElement = leftElement;
    }
    else {
        maxElement = i;
    }

    if (rightElement < virtualArrayLength && arrayToSort[rightElement].value > arrayToSort[maxElement].value){
        maxElement = rightElement;
    }

    if (maxElement != i){
        arrayToSort = await swapIndexes(arrayToSort, i, maxElement);
        arrayToSort = await heapify(arrayToSort, maxElement);
    }

    return arrayToSort;
}

async function swapIndexes(array, index1, index2) {
    temp = array[index2];
    array[index2] = array[index1];
    array[index1] = temp;

    array[index1].SetIndex(index1);
    array[index2].SetIndex(index2);

    // Visuals

    array[index1].SetColor(1);
    array[index2].SetColor(1);

    await playBleep(5, Math.floor(((((array[index1].value)/(barArray.length) * 100) * 10) + 500)));
    await drawBars();
    await sleep(5);
    array[index1].SetColor(0);
    array[index2].SetColor(0);

    return array;
}

// Entry to each algorithm

async function shuffleBarsEntry(){
    if (!shuffling){
        await shuffleBars();
    }
}

async function bubbleSortEntry(){
    // This sort works by swapping adjacent elements until the whole array is sorted
    // Complexity: n^2   
    if (!shuffling){
        await bubbleSort();
    }
}

async function insertionSortEntry(){
    // This sort works by creating a sorted and unsorted array. Each element in the unsorted array is inserted into its correct position in
    // the sorted array until the array is fully sorted
    // Complexity: n^2

    if (!shuffling){
        await insertionSort();
    }
}

async function selectionSortEntry(){
    // This sort works by finding which of the remaining elements should come next and placing it in the correct position
    // Complexity: n^2
    if (!shuffling){
        await selectionSort();
    }
}

async function saltShakerSortEntry(){
    // This sort works similarly to bubble sort but changes the direction of sorting each pass
    // Complexity: n^2
    if (!shuffling){
        await saltShakerSort();
    }   
}

async function gnomeSortEntry(){
    // This algoritm works by the following commands. If the two elements next to eachother are in the correct order, move a step forwards
    // if the two elements are not in the correct order, swap them and move a step backwards
    // Complexity: n^2
    if (!shuffling){
        await gnomeSort();
    }
}

async function combSortEntry() {
    // This algorithm works like bubble sort but instead of comparing adjacent elements, it compares elements with a larger gap size
    // (Imagine going through a list with a finer and finer comb)
    // Complexity: omega(n^2 / 2^p)
    if (!shuffling){
        await combSort();
    }
}

async function pancakeSortEntry() {
    // This algorithm works under the principle that the array is a stack of pancakes and the only way to sort them is to place a
    // spatula between the elements and flip every element in some subset of the array
    // Complexity: 
    if (!shuffling){
        await pancakeSort();
    }
}

async function bogoSortEntry(){
    // This sort works by finding which of the remaining elements should come next and placing it in the correct position
    // Complexity: n!
    if (!runBogo && !shuffling){
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
    // Complexity: n log(n)

    if (!shuffling){
        shuffling = true;
        barArray = await mergeSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function quickSortEntry(){
    // This sort arranges all elements as being either greater than or less than a selected pivot
    // Complexity: n log(n)
    if (!shuffling){
        shuffling = true;
        barArray = await quickSort(barArray, 0);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function heapSortEntry(){
    // This sort uses ordered trees (heaps) to reduce the number of comparisons needed to sort the list
    // Complexity: n log(n)
    if (!shuffling){
        shuffling = true;
        barArray = await heapSort(barArray);
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