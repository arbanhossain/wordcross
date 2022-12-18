console.log(WORDS_ARRAY.length);
console.log(WORDS_SET.size);

const GAME_STATE = {
  N: 5,
  CurrentEligible: [],
  CurrentWord: '',
  Start: null,
  End: null,
}

let IsMouseDown = false;

const GetNeighbors = (row, col) => {
  row = parseInt(row);
  col = parseInt(col);
  // Treat Top, Down, Left and Right as neighbords
  let neighbors = [];
  let N = GAME_STATE.N;
  if (row > 0) {
    neighbors.push(`${row - 1}-${col}`);
  }
  if (row < N - 1) {
    neighbors.push(`${row + 1}-${col}`);
  }
  if (col > 0) {
    neighbors.push(`${row}-${col - 1}`);
  }
  if (col < N - 1) {
    neighbors.push(`${row}-${col + 1}`);
  }

  return neighbors;
}

const MakeTable = (N) => {
  // Create a 2D Array of letters and then populate them in an HTML table
  let table = document.getElementById("playgrid");
  table.innerHTML = "";
  for (let i = 0; i < N; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < N; j++) {
      let cell = document.createElement("td");
      // Set cell innerText to random letter between A-Z
      cell.innerText = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
      cell.setAttribute("data-row", i);
      cell.setAttribute("data-col", j);
      cell.setAttribute("class", "cell");
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  AddEvents();
}

const IsOnALine = (End) => {
  let Start = GAME_STATE.Start;
  let xs = parseInt(Start[0]);
  let ys = parseInt(Start[1]);
  let xe = parseInt(End[0]);
  let ye = parseInt(End[1]);

  return (xs == xe || ys == ye || Math.abs(xs-xe) == Math.abs(ys-ye));
}

const GetCellsBetween = () => {
  let Start = GAME_STATE.Start;
  let End = GAME_STATE.End;
  let Cells = [];
  
}

const Highlight = () => {
  let Start = GAME_STATE.Start;
  let End = GAME_STATE.End;
  let StartString = `${Start[0]}-${Start[1]}`;
  let EndString = `${End[0]}-${End[1]}`;
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    let CellString = `${cell.dataset.row}-${cell.dataset.col}`;
    if (CellString == StartString || CellString == EndString) cell.classList.add("highlighted");
  })
}

const AddEvents = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    //console.log(cell)
    cell.addEventListener("mousedown", (e) => {
      e.preventDefault();
      IsMouseDown = true;
      cell.classList.add("highlighted");
      GAME_STATE.Start = [cell.dataset.row, cell.dataset.col]
    });
    cell.addEventListener("mouseover", (e) => {
      e.preventDefault();
      if (IsMouseDown) {
        if (IsOnALine([cell.dataset.row, cell.dataset.col])){
          UnHighlight();
          GAME_STATE.End = [cell.dataset.row, cell.dataset.col];
          Highlight();
        } else {
          console.log([cell.dataset.row, cell.dataset.col]);
        }
      }
    })
  })
}

const UnHighlight = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    cell.classList.remove("highlighted");
  });
}

const GameLogic = () => {
  // Game Logic
  MakeTable(GAME_STATE.N);
}

document.addEventListener("mouseup", () => {
  IsMouseDown = false;
  UnHighlight();
  console.log(GAME_STATE.CurrentWord);
  GAME_STATE.CurrentWord = '';
})

GameLogic();