// Setup Canvas
const canvas = document.getElementById("AlgorithmCanvas");
const ctx = canvas.getContext("2d");

// Setup Variables
barArray = [];
numBarsToMake = 200;
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

async function playBleep(duration, frequency = 1000) {
    let decay = 0.05;
    let currentTime = audioCtx.currentTime;
    const oscNode = new OscillatorNode(audioCtx, {type: "square", frequency: frequency});
    const gainNode = new GainNode(audioCtx, {gain: 0});
    oscNode.connect(gainNode).connect(audioCtx.destination);

    oscNode.frequency.setValueAtTime(frequency, currentTime);
    oscNode.start(currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, currentTime + 0.001);
    gainNode.gain.linearRampToValueAtTime(0, currentTime + decay + 0.001);
    oscNode.stop(currentTime + decay + 0.001);
}

async function shuffleBars(fromBogo = false){
    if (!fromBogo) { 
        runBogo = false; 
    }
    shuffling = true;
    for (let index = (barArray.length - 1); index > 0; index--){
        // Find a random index past i (or i)
        newIndex = Math.floor(Math.random() * index);
        
        barArray = await swapIndexes(barArray, newIndex, index);
        if (!shuffling){
            break;
        }
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
                barArray = await swapIndexes(barArray, index, index + 1);
                elementSwapped = true;
            }       
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
            barArray = await swapIndexes(barArray, index, index - 1);
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
                barArray = await swapIndexes(barArray, index1, index2);
            }
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
                    barArray = await swapIndexes(barArray, index, index + 1);
                    elementSwapped = true;
                }       
            }
        }
        else{
            for (let index = barArray.length-Math.floor(numIterations/2) - 1; index > Math.floor(numIterations/2)-1; index--){
                if (barArray[index-1].value > barArray[index].value){
                    // Swap the indexes
                    barArray = await swapIndexes(barArray, index, index - 1);
                    elementSwapped = true;
                }       
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
            barArray = await swapIndexes(barArray, i, i + 1)
            // Move back one
            if (i > 0){
                i--;
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
    while (elementSwapped || gapSize > 1){
        gapSize = gapSize/1.3;
        let gap = Math.floor(gapSize);
        elementSwapped = false;
        for (let index = 0; index < barArray.length-gap; index++){
            if (barArray[index+gap].value < barArray[index].value){
                // Swap the indexes
                barArray = await swapIndexes(barArray, index + gap, index);
                elementSwapped = true;
            }      
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
    virtualArrayLength = (arrayToSort.length);
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

// Algorithms for odd even sort // 
async function oddEvenSort(arrayToSort){
    // Works similarly to bubble sort but compares pairs of odd and even indexed elements (eg. in list 1, 5, 9, 7
    // it compares 1, 5 and 7, 9. Then second pass compares 5, 7 (which is now in position 2 instead of 9). )
    // Complexity: n^2
    let sorted = false;

    while (sorted == false){
        sorted = true;
        for (let i = 0; i < arrayToSort.length - 1; i += 2){
            if (arrayToSort[i + 1].value <= arrayToSort[i].value){
                arrayToSort = await swapIndexes(arrayToSort, i, i+1);
                sorted = false;
            }
        }
        for (let i = 1; i < arrayToSort.length - 1; i += 2){
            if (arrayToSort[i + 1].value <= arrayToSort[i].value){
                arrayToSort = await swapIndexes(arrayToSort, i, i+1);
                sorted = false;
            }
        }
    }

    return arrayToSort;
}

// Algorithms for radix sort
async function radixSort(arrayToSort){
    // Temp code //
    let maxPlaceValue = 3;
    // Radix sort works by placing numbers into "buckets" based on their least significant digit.
    for (let i = 0; i < maxPlaceValue; i++){
        let buckets = [];
        for (let j = 0; j < 10; j++){
            buckets.push([]);
        }

        for (let j = 0; j < arrayToSort.length; j++){
            digit = await getDigitAtPlace(arrayToSort[j].value, i);
            buckets[digit].push(arrayToSort[j]);
        }

        // Adjust the indexes to reflect the change in position //
        let totalLength = 0;
        for (let j = 0; j < buckets.length; j++){
            bucket = buckets[j];
            for (let k = 0; k < bucket.length; k++){
                bucket[k].SetIndex(totalLength);
                bucket[k].SetColor(1);
                await drawBars();
                await playBleep(5, Math.floor(((((bucket[k].value)/(barArray.length) * 100) * 10) + 500)));
                await sleep(5);
                bucket[k].SetColor(0);
                totalLength++;
            }
        }

        let tempSortedArray = [];
        for (let j = 0; j < buckets.length; j++){
            bucket = buckets[j];
            tempSortedArray = tempSortedArray.concat(bucket);
        }
        arrayToSort = tempSortedArray;
    }

    return arrayToSort;
}

async function getDigitAtPlace(value, place){
    return Math.floor(value / ( Math.pow(10, place) ) ) % 10;
}

// Algorithms for shell sort //

async function shellSort(arrayToSort){
    let gapSize = arrayToSort.length;
    
    while (gapSize > 1){
        gapSize = Math.floor(gapSize / 1.3);
        for (let i = gapSize; i < arrayToSort.length; i++){
            let index = i;
            while (arrayToSort[index].value < arrayToSort[index-gapSize].value){
                // Swap the elements
                arrayToSort = await swapIndexes(arrayToSort, index, index - gapSize);
                if ((index - gapSize) > gapSize) { index -= gapSize; }
                else { break; }
            }
            //await correctOrderComparison(arrayToSort, index, index - gapSize);
        }
    }

    return arrayToSort;
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

async function shellSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await shellSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
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

async function oddEvenSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await oddEvenSort(barArray);
        await drawBars();
        await greenPass();
        shuffling = false;
    }
}

async function radixSortEntry(){
    if (!shuffling){
        shuffling = true;
        barArray = await radixSort(barArray);
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

/*async function correctOrderComparison(array, index1, index2){
    array[index1].SetColor(2);
    array[index2].SetColor(2);
    await playBleep(5, Math.floor(((((array[index1].value)/(barArray.length) * 100) * 10) + 500)));
    await drawBars();
    await sleep(5);
    array[index1].SetColor(0);
    array[index2].SetColor(0);
}*/