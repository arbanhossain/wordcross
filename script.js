console.log(WORDS_ARRAY.length);
console.log(WORDS_SET.size);

const GAME_STATE = {
  N: 4,
  CurrentEligible: [],
  CurrentWord: ''
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

const AddEvents = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    //console.log(cell)
    cell.addEventListener("mousedown", (e) => {
      e.preventDefault();
      IsMouseDown = true;
      if (!cell.classList.contains("highlighted")){
        cell.classList.add("highlighted");
        GAME_STATE.CurrentEligible = GetNeighbors(cell.dataset.row, cell.dataset.col);
        GAME_STATE.CurrentWord += cell.innerText;
      }
    });
    cell.addEventListener("mouseover", (e) => {
      e.preventDefault();
      if (IsMouseDown) {
        if (!cell.classList.contains("highlighted") && GAME_STATE.CurrentEligible.includes(`${cell.dataset.row}-${cell.dataset.col}`)){
          cell.classList.add("highlighted");
          GAME_STATE.CurrentEligible = GetNeighbors(cell.dataset.row, cell.dataset.col);
          GAME_STATE.CurrentWord += cell.innerText;
        } else {
          console.log([cell.dataset.row, cell.dataset.col]);
        }
      }
    })
  })
}

const GameLogic = () => {
  // Game Logic
  MakeTable(GAME_STATE.N);
}

document.addEventListener("mouseup", () => {
  IsMouseDown = false;
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    cell.classList.remove("highlighted");
  })
  console.log(GAME_STATE.CurrentWord);
  GAME_STATE.CurrentWord = '';
})

GameLogic();