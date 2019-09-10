// Constants
const NUM_ROWS = 32;
const NUM_COLS = 74;

const START_POS = {
    row: 15,
    col: 7,
}
const END_POS = {
    row: 15,
    col: 60
}

const SEARCH_DELAY = 10;
const PATH_DELAY = 50;

// Globals
activeAlgorithm = "";

$(document).ready(function(){
    createCells();
    setCellSelectionCallbacks();
});

function createCells(){
    var cells = document.getElementById("cells");

    for(var i = 0; i < NUM_ROWS; i++){
        var newRow = cells.insertRow(i);

        for(var j = 0; j < NUM_COLS; j++){
            var newCell = newRow.insertCell(j);

            newCell.innerHTML = "";

            if (i == START_POS.row && j == START_POS.col){
                newCell.className = "path-start";
            } else if (i == END_POS.row && j == END_POS.col){
                newCell.className = "path-end";
            } else {
                newCell.className = "unvisited";
            }
        }
    }
}

function clearCells(){
    var cellGrid = document.getElementById('cells')

    for (let row of cellGrid.rows) 
    {
        for(let cell of row.cells) 
        {
            if (cell.className != "path-start" && cell.className != "path-end"){
                cell.className = "unvisited";
            }
        }
    }
}

function setCellSelectionCallbacks(){
    var mouseDown = false;
    var latestUpdatedCell;

	$("td").mousedown(function(event) {
        mouseDown = true;

        if(latestUpdatedCell != this){
            //we don't want to edit the start and end
            if (this.className == "path-start" || this.className == "path-end"){
                return;
            }

            $(this).toggleClass("wall")
            $(this).toggleClass("unvisited")
            latestUpdatedCell = this; 
            return false;
        }
	});

	$("td").mousemove(function() {
		if (mouseDown && latestUpdatedCell != this) {
            //we don't want to edit the start and end
            if (this.className == "path-start" || this.className == "path-end"){
                return;
            }

            $(this).toggleClass("wall")
            $(this).toggleClass("unvisited")
            latestUpdatedCell = this;
		}
	});
	
	$(document).mouseup(function() {
        mouseDown = false;
        latestUpdatedCell = null;
	});
}

function setActiveAlgorithm(algorithm){ 
    activeAlgorithm = algorithm;
    document.getElementById('runAlgorithmButton').innerHTML = "Run " + activeAlgorithm;
}

function runActiveAlgorithm(){
    switch(activeAlgorithm){
        case 'Breadth First Search':
            runBFS();
        case 'Depth First Search':
            
        default:
            return;
    }   
}

async function runBFS(){
    console.log("RUNNING BFS");

    // First we convert our table element into a 2D array
    var tableElement = document.getElementById('cells');

    var cells = new Array(NUM_ROWS);
    for (var i = 0; i < NUM_ROWS; i++) {
        cells[i] = new Array(NUM_COLS);
    }

    for(var i = 0; i < NUM_ROWS; i++){
        for(var j = 0; j < NUM_COLS; j++){
            cells[i][j] = tableElement.rows[i].cells[j];
        }
    }

    // now we begin BFS
    var queue = [];

    var visited = new Array(NUM_ROWS).fill(false).map(() => new Array(NUM_COLS).fill(false));
    
    
    var prev = new Array(NUM_ROWS).fill(0).map(() => new Array(NUM_COLS).fill(0));

    var starting_cell = cells[START_POS.row][START_POS.col];
    queue.push(starting_cell);
    visited[START_POS.row][START_POS.col] = true;

    while(queue.length > 0){
        var currCell = queue.shift();

        var curRow = currCell.parentElement.rowIndex;
        var curCol = currCell.cellIndex;

        // check if we have found the goal node
        if(currCell.className == "path-end"){
            break;
        } else {
            //we don't want to change path-start
            if(currCell.className != "path-start"){
                currCell.className = "visited";
            }
        }

        // add any adjacent neighbors that have not already been visited
        if (curRow - 1 >= 0) {
            var UP_NEIGHBOR = cells[curRow - 1][curCol];
            if(UP_NEIGHBOR.className != "wall" && !visited[curRow - 1][curCol]){
                queue.push(UP_NEIGHBOR);
                visited[curRow - 1][curCol] = true;
                prev[curRow - 1][curCol] = [curRow, curCol]
            }
        }

        if (curCol + 1 < NUM_COLS) {
            var RIGHT_NEIGHBOR = cells[curRow][curCol + 1];
            if(RIGHT_NEIGHBOR.className != "wall" && !visited[curRow][curCol + 1]){
                queue.push(RIGHT_NEIGHBOR);
                visited[curRow][curCol + 1] = true;
                prev[curRow][curCol + 1] = [curRow, curCol]
            }
        }

        if (curRow + 1 < NUM_ROWS) {
            var DOWN_NEIGHBOR = cells[curRow + 1][curCol];
            if(DOWN_NEIGHBOR.className != "wall" && !visited[curRow + 1][curCol]){
                queue.push(DOWN_NEIGHBOR);
                visited[curRow + 1][curCol] = true;
                prev[curRow + 1][curCol] = [curRow, curCol]
            }
        }

        if (curCol - 1 >= 0) {
            var LEFT_NEIGHBOR = cells[curRow][curCol - 1];
            if(LEFT_NEIGHBOR.className != "wall" && !visited[curRow][curCol - 1]){
                queue.push(LEFT_NEIGHBOR);
                visited[curRow][curCol - 1] = true;
                prev[curRow][curCol - 1] = [curRow, curCol]
            }
        }

        await sleep(SEARCH_DELAY);
    }

    //find path and draw
    var path = []

    var row = END_POS.row
    var col = END_POS.col
    while(prev[row][col] != 0){
        path.push([row, col])

        var temp = prev[row][col]

        row = temp[0]
        col = temp[1]
    }

    path = path.reverse();

    for(var i = 0; i < path.length; i++){
        var row = path[i][0];
        var col = path[i][1];

        var cell = cells[row][col];

        if(cell.className != "path-end"){
            cell.className = "path-traversal";
        }
        await sleep(PATH_DELAY);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}