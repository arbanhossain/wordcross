console.log(WORDS_ARRAY.length);
console.log(WORDS_SET.size);

const GAME_STATE = {
  H: 8,
  W: 10,
  CurrentEligible: [],
  CurrentWord: '',
  Start: null,
  End: null,
  Solve: [],
  Score: 0,
  Found: [],
  AllFound: [],
  Level: null,
  Total: 0,
}

if (localStorage.getItem('Level') === null) {
  GAME_STATE.Level = 1;
  localStorage.setItem('Level', 1);
} else {
  GAME_STATE.Level = parseInt(localStorage.getItem('Level'));
}

if (localStorage.getItem('Total') === null) {
  GAME_STATE.Total = 0;
  localStorage.setItem('Total', GAME_STATE.Total);
} else {
  GAME_STATE.Total = parseInt(localStorage.getItem('Total'));
}

let IsMouseDown = false;

let DirectionsArray = [
  [0, 1], // Right
  [0, -1], // Left
  [1, 0], // Down
  [-1, 0], // Up
  [1, 1], // Down Right
  [1, -1], // Down Left
  [-1, 1], // Up Right
  [-1, -1], // Up Left
]

const is_touch_enabled = () => {
	return ( 'ontouchstart' in window ) ||
		( navigator.maxTouchPoints > 0 ) ||
		( navigator.msMaxTouchPoints > 0 );
}


const MakeSearchGrid = (W, H) => {
  let table = [];
  for (let i = 0; i < H; i++) {
    let temp = [];
    for (let i = 0; i < W; i++) {
      temp.push('.');
    }
    table.push(temp);
  }
  return table;
}

const ShowGrid = (table) => {
  let str = '';
  for (let i = 0; i < table.length; i++) {
    str += table[i].join('') + '\n';
  }
  console.log(str);
}

const GetJumbledDirection = (Directions) => {
  // Shuffle the array randomly
  for (let i = 0; i < Directions.length; i++) {
    let j = Math.floor(Math.random() * Directions.length);
    let temp = Directions[i];
    Directions[i] = Directions[j];
    Directions[j] = temp;
  }
  return Directions;
}

const AllPositions = (W, H) => {
  let arr = []
  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      arr.push([i, j]);
    }
  }
  return arr;
}

const PopulateGrid = (table, count) => {
  let WordsUsed = new Set();
  while(count != 0) {
    try {
      //let data = await readInput();
      // Select a random word from WORDS_ARRAY
      let word = WORDS_ARRAY[Math.floor(Math.random() * WORDS_SIZE)];
      if(WordsUsed.has(word)) continue;
      let word_len = word.length;
      
      let placed = false;
      
      let AllPos = GetJumbledDirection(AllPositions(table.length, table[0].length));

      for(let z = 0; z < AllPos.length; z++){
          let i = AllPos[z][0];
          let j = AllPos[z][1];
          if (placed) break;
          // Iterate over all directions
          let Directions = GetJumbledDirection(Array.from(DirectionsArray));
          Directions.forEach(dir => {
            if (placed) return;
            // Check if End is in bounds
            let end = [j + dir[0] * (word_len - 1), i + dir[1] * (word_len - 1)];
            if (end[0] < 0 || end[0] >= table.length || end[1] < 0 || end[1] >= table[0].length) {
              // console.log(`${end[0]}-${end[1]}`)
            } else {
              // Check if word can be placed in that direction
              let flag = true;
              for (let k = 0; k < word_len; k++) {
                let x = i + dir[0] * k;
                let y = j + dir[1] * k;
                if (table[x][y] != '.' && table[x][y] != word[k]) {
                  flag = false;
                  break;
                }
              }
              if (flag) {
                // Place the word
                for (let k = 0; k < word_len; k++) {
                  let x = i + dir[0] * k;
                  let y = j + dir[1] * k;
                  table[x][y] = word[k].toUpperCase();
                  WordsUsed.add(word);
                }
                placed = true;
                //ShowGrid(table);
                //console.log(`Direction used ${dir}`);
                count--;
                return;
              }
            }
          })
      }
    } catch (error) {
      //console.error(error);
    }
  }
  return WordsUsed;
}

const FillGrid = (table) => {
  for (let i = 0; i < table.length; i++) {
    for (let j = 0; j< table[0].length; j++) {
      if(table[i][j] == '.') table[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
  }
}

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

const MakeTable = (H, W) => {
  let Table = MakeSearchGrid(W, H);

  let words = PopulateGrid(Table, Math.floor((W*H)/12));
  GAME_STATE.Solve = Array.from(words);
  FillGrid(Table);
  // Create a 2D Array of letters and then populate them in an HTML table
  let table = document.getElementById("playgrid");
  table.innerHTML = "";
  for (let i = 0; i < H; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < W; j++) {
      let cell = document.createElement("td");
      // Set cell innerText to random letter between A-Z
      cell.innerText = Table[i][j];
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
  let xs = parseInt(Start[0]);
  let ys = parseInt(Start[1]);
  let xe = parseInt(End[0]);
  let ye = parseInt(End[1]);
  let xDelta, yDelta;
  if (xe == xs) xDelta = 0;
  else xDelta = (xe - xs) / Math.abs(xe - xs);
  if (ye == ys) yDelta = 0;
  else yDelta = (ye - ys) / Math.abs(ye - ys);
  // console.log(`
  //   StartX: ${xs}
  //   StartY: ${ys}
  //   EndX: ${xe}
  //   EndY: ${ye}
  //   IncrementX: ${xDelta}
  //   IncrementY: ${yDelta}
  // `)
  for(let i = xs, j = ys; i != xe || j != ye; i+=xDelta, j+=yDelta) {
    Cells.push(`${i}-${j}`);
  }
  // Push End
  Cells.push(`${xe}-${ye}`);
  return Cells;
}

const Highlight = () => {
  let Cells = GetCellsBetween();
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    let CellString = `${cell.dataset.row}-${cell.dataset.col}`;
    if (Cells.includes(CellString)) {
      cell.classList.add("highlighted");
    };
  })
  GetHighlightedWord();
}

const PermaHighlight = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    if (cell.classList.contains("highlighted")) {
      cell.classList.add("permahighlighted");
    };
  })
}

const GetHighlightedWord = () => {
  GAME_STATE.CurrentWord = '';
  let HighlitedCells = GetCellsBetween();
  let Cells = Array.from(document.getElementsByClassName('cell'));
  HighlitedCells.forEach(highlight => {
    let cell = Cells.filter(el => `${el.dataset.row}-${el.dataset.col}` == highlight)[0];
    GAME_STATE.CurrentWord += cell.innerText;
  })
}

const AddEvents = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    // cell.addEventListener("touchstart", (e) => {
    //   // e.preventDefault();
    //   console.log("touchstart");
    //   if (!IsMouseDown) {
    //     IsMouseDown = true;
    //     cell.classList.add("highlighted");
    //     GAME_STATE.Start = [cell.dataset.row, cell.dataset.col]
    //   } else {
    //     if (IsOnALine([cell.dataset.row, cell.dataset.col])){
    //       UnHighlight();
    //       GAME_STATE.End = [cell.dataset.row, cell.dataset.col];
    //       Highlight();
    //     }
    //   }
    // }, {passive: true})
    //console.log(cell)
    cell.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      IsMouseDown = true;
      cell.classList.add("highlighted");
      GAME_STATE.Start = [cell.dataset.row, cell.dataset.col]
    });
    cell.addEventListener("pointerover", (e) => {
      e.preventDefault();
      if (IsMouseDown) {
        if (IsOnALine([cell.dataset.row, cell.dataset.col])){
          UnHighlight();
          GAME_STATE.End = [cell.dataset.row, cell.dataset.col];
          Highlight();
        } else {
          //console.log([cell.dataset.row, cell.dataset.col]);
        }
      }
    })
    // cell.addEventListener("touchstart", (e) => {
    //   // e.preventDefault();
    //   console.log("touchstart");
    //   IsMouseDown = true;
    //   cell.classList.add("highlighted");
    //   GAME_STATE.Start = [cell.dataset.row, cell.dataset.col]
    // }, {passive: true});
    // cell.addEventListener("touchmove", (e) => {
    //   // e.preventDefault();
    //   console.log(cell.innerText);
    //   if (IsMouseDown) {
    //     if (IsOnALine([cell.dataset.row, cell.dataset.col])){
    //       UnHighlight();
    //       GAME_STATE.End = [cell.dataset.row, cell.dataset.col];
    //       Highlight();
    //     } else {
    //       //console.log([cell.dataset.row, cell.dataset.col]);
    //     }
    //   }
    // }, {passive: true})
  })
}

const UnHighlight = () => {
  Array.from(document.getElementsByClassName('cell')).forEach(cell => {
    cell.classList.remove("highlighted");
  });
}

const UpdateScore = () => {
  document.getElementById("score").innerText = GAME_STATE.Score;
  document.getElementById("level").innerText = GAME_STATE.Level;
  document.getElementById("total").innerText = GAME_STATE.Total;
  let wordlist = ``;
  GAME_STATE.Solve.forEach(word => {
    if (GAME_STATE.Found.includes(word)) wordlist += `<li><strike>${word}</strike></li><br>`;
    else wordlist += `<li>${word}</li><br>`;
  })
  document.getElementById("wordlist").innerHTML = wordlist;
  //console.log(GAME_STATE.Score);
}

const GameLogic = () => {
  let X = Math.round(GAME_STATE.Level / 2);
  let Y = GAME_STATE.Level - X;
  console.log(X, Y);
  MakeTable(GAME_STATE.H + Y, GAME_STATE.W + X);
  UpdateScore();
}

const UpMouseOrTouch = () => {
  IsMouseDown = false;
  if (GAME_STATE.AllFound.includes(GAME_STATE.CurrentWord.toLowerCase())) {
    console.log("Already Found");
  }
  else if (GAME_STATE.Solve.includes(GAME_STATE.CurrentWord.toLowerCase())) {
    GAME_STATE.Score += GAME_STATE.CurrentWord.length;
    GAME_STATE.Found.push(GAME_STATE.CurrentWord.toLowerCase());
    GAME_STATE.AllFound.push(GAME_STATE.CurrentWord.toLowerCase());
    PermaHighlight();
  }
  else if (WORDS_SET.has(GAME_STATE.CurrentWord.toLowerCase())) {
    GAME_STATE.Score += 1;
    GAME_STATE.AllFound.push(GAME_STATE.CurrentWord.toLowerCase());
  }
  UpdateScore();
  UnHighlight();
  GAME_STATE.CurrentWord = '';
  if (GAME_STATE.Found.length == GAME_STATE.Solve.length) {
    Math.random() > 0.5 ? GAME_STATE.H++ : GAME_STATE.W++;
    localStorage.setItem("H", GAME_STATE.H);
    localStorage.setItem("W", GAME_STATE.W);
    GAME_STATE.Found = [];
    GAME_STATE.Level += 1;
    localStorage.setItem("Level", GAME_STATE.Level);
    GAME_STATE.Total += GAME_STATE.Score;
    localStorage.setItem("Total", GAME_STATE.Total);
    GAME_STATE.Score = 0;
    UpdateScore();
    GameLogic();
  }
}

document.addEventListener("pointerup", UpMouseOrTouch);

GameLogic();