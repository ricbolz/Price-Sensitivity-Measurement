import fs from 'fs';
import yargs from 'yargs';
import csv from 'csv-parser';

//Array for contain the data from each column
const expensive : number[] = []     //高い
const cheap : number[] = []         //安い　
const tooExpensive : number[] = []  //高すぎる
const tooCheap : number[] = []      //安すぎる
//Array for contain the cumulative data of each column 
const cumulExpensive : number[] = []    //高い
const cumulCheap : number[] = []        //安い
const cumulTooExpensive : number[] = [] //高すぎる
const cumulTooCheap : number[] = []     //安すぎる

//Array for contain price with range between price data. It can be set by calling setPriceRange function
const prices: number[] = []


/**
 * Reads data from a CSV file and populates arrays with specific columns.
 *
 * @param {string} csvFilePath - The path to the CSV file.
 * @return {Promise<void>} A promise that resolves when the CSV data is read.
 */
async function readCSVFile(csvFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (row) => {
                expensive.push(parseInt(row["高い"]));
                cheap.push(parseInt(row["安い"]));
                tooExpensive.push(parseInt(row["高すぎる"]));
                tooCheap.push(parseInt(row["安すぎる"]));
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                console.log("Error no File")
                reject(error);
            });
    });
}

/**
 * Counts the number of elements in the data array that satisfy a specific condition.
 *
 * @param {number[]} data - The array to count elements from.
 * @param {number} price - The price to compare against.
 * @param {string} type - The type of condition ("loweq" or "higheq").
 * @return {number} The count of elements satisfying the condition.
 */

function CountIf(data: number[], price:number,type:string) {
    let sum:number  = 0
    for (const dataPrice of data) {
        if(type === "loweq") {  //Find the count of data that lower or Equal with the price
            if (dataPrice <= price) {
                sum = sum + 1
            }
        } else if (type === "higheq"){  //Find the count of data that higher or Equal with the price
            if(dataPrice >= price) {
                sum = sum + 1
            }
        } 
        
    }
    return sum;
}

/**
 * Pushes cumulative values to an array based on the count of elements satisfying a condition.
 *
 * @param {number[]} data - The data array to count elements from.
 * @param {number[]} prices - The array of prices to calculate cumulative values for.
 * @param {number[]} cumul - The array to store cumulative values.
 * @param {string} type - The type of condition ("loweq" or "higheq").
 */
function pushCumulative(data: number[], prices: number[], cumul : number[],type:string) {
    
    for (const data2 of prices) {
        const cumulative = CountIf(data,data2,type)/ data.length
        cumul.push(cumulative)
    }
    
}


/**
 * Calculates the intersection point of two line segments.
 *
 * @param {number[][]} line1 - The coordinates of the first line segment.
 * @param {number[][]} line2 - The coordinates of the second line segment.
 * @return {number[]} The intersection point [x, y], or [0, 0] if no intersection.
 */
function line_intersect(line1: number[][],line2:number[][]) {         
    const xdiff = [line1[0][0] - line1[1][0], line2[0][0] - line2[1][0]]
    const ydiff = [line1[0][1] - line1[1][1], line2[0][1] - line2[1][1]]
    const det = ydiff[0]*xdiff[1] - xdiff[0]*ydiff[1]
    if(det !== 0) {
        const xInt =  ( ( (line2[0][1] - line1[0][1])* (xdiff[0])*xdiff[1] ) + (line1[0][0]*ydiff[0]*xdiff[1] ) - (line2[0][0]*ydiff[1]*xdiff[0])) / det
        const yInt =  (xInt*(ydiff[0]/xdiff[0])) + line1[0][1] - (line1[0][0]*(ydiff[0]/xdiff[0]))
        //assume x is same
        const IsXinRange = (xInt >= line1[0][0] && xInt <= line1[1][0]) 
        const isYinRange = (yInt >= line1[0][1] && yInt <= line1[1][1]) || (yInt >= line2[0][1] && yInt >= line2[1][1])
        if(IsXinRange && isYinRange) {
            return [xInt,yInt];
        } 
    } 
    return [0,0]
}

/**
 * Checks for an intersection point between two cumulative distribution lines.
 *
 * @param {number[]} cumu1 - The first cumulative distribution line.
 * @param {number[]} cumu2 - The second cumulative distribution line.
 * @return {number[]} The intersection point [x, y], or [0, 0] if no intersection.
 */
function checkIntersection(cumu1: number[], cumu2: number[]) {
    for (let i = 0; i < prices.length - 1; i++) {
        const lin1 = [[prices[i], cumu1[i]], [prices[i+1], cumu1[i+1]]]
        const lin2 = [[prices[i], cumu2[i]], [prices[i+1], cumu2[i+1]]]

        const intersectionPoint = line_intersect(lin1, lin2);
        if (intersectionPoint[0] !== 0 || intersectionPoint[1] !== 0) {
            return intersectionPoint; // Return the first non-zero intersection point found
        }
    }
    return [0,0];
    
}

/**
 * Displays the Price Sensitivity Metrics (PSM) values.
 *
 * @param {number} highest - The highest price.
 * @param {number} compromise - The compromise price.
 * @param {number} ideal - The ideal price.
 * @param {number} lowest - The lowest price.
 */
function showPSM(highest: number, compromise:number, ideal:number, lowest:number) {
    console.log("最高価格 : "+highest.toFixed(4)+"円")
    console.log("妥協価格 : "+compromise.toFixed(4)+"円")
    console.log("理想価格 : "+ideal.toFixed(4)+"円")
    console.log("最低品質保証価格 : "+lowest.toFixed(4)+"円")
}

/**
 * Loads cumulative distribution data and calculates PSM values.
 */
function load_cumulative() {
        //count the cumulative of the price that expensive
        pushCumulative(expensive,prices,cumulExpensive,"loweq")
        //count the cumulative of the price that cheap
        pushCumulative(cheap,prices,cumulCheap,"higheq")
        //count the cumulative of the price that  is too Expensive
        pushCumulative(tooExpensive,prices,cumulTooExpensive,"loweq")
        //count the cumulative of the price that is too cheap
        pushCumulative(tooCheap,prices,cumulTooCheap,"higheq")
}
/**
 * 
 * Push prices in const price between the lowest and highest price with some range between the two prices
 * @param lower lowest price (first data)
 * @param upper highest price (last data)
 * @param range range between the two data of price
 */
function setPriceRange(lower:number, upper:number, range:number) {
    if(lower > upper) {
        [lower, upper] = [upper,lower]
    }
    for(let i = lower; i <= upper; i += range) {
        prices.push(i)
    }

}

const main = async () => {
   
    const argv = yargs.option('csvfile', {
        alias: 'c',
        description: 'csv file',
        demandOption: true,
        requiresArg : true
    }).parseSync();

    const csvPath = argv.csvfile + '.csv';

    if (csvPath === undefined) {
        console.log("Error no file")
        return;
    }
    
    try {
        //Read Data
        await readCSVFile(csvPath);
        //Set Price Range
        const lowerPrice = 50
        const upperPrice = 600
        const range = 50
        setPriceRange(lowerPrice,upperPrice,range)

        //Set the cumulative data from csv file with the prices
        load_cumulative()
        
        //Find the Highest, Ideal, Compromise, and Lowest Price based from the cumulative data
        const arr = [cumulExpensive,cumulCheap, cumulTooExpensive, cumulTooCheap]
        const ideal = checkIntersection(arr[0],arr[1])
        const lowest =checkIntersection(arr[0],arr[3])
        const highest = checkIntersection(arr[2], arr[1])
        const compromise = checkIntersection(arr[2], arr[3])

        //Show the Highest, Ideal, Compromise, and Lowest Price
        showPSM(highest[0], compromise[0],ideal[0],lowest[0])
     
    } catch (error) {
        console.error("An error occurred:", error);
    }
};

main();
