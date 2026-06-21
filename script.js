console.log("js");

const SIZE=20;//棋盘大小


const board = document.getElementById("board");
const info =document.getElementById("info");



// 0 = 空，1 = 黑棋，2 = 白棋
let boardState = Array.from({length:SIZE}, () => new Array (SIZE).fill(0))
let current = 1;   // 当前轮到谁，1=黑（先手），2=白
let gameOver = false;    // 游戏是否已结束
let lastStone = null;
let history = [];   // 落子历史，每项 { r, c, player, stone }，用于悔棋
/* 初始化棋盘数据 */
function createBoard() {
     for (let r = 0; r < SIZE; r++){
     for (let c = 0; c < SIZE; c++) {
     const cell = document.createElement("div");
     cell.className = "cell";
     cell.dataset.row = r;
     cell.dataset.col = c;
     cell.addEventListener("click",handleClick);
     board.appendChild(cell);
    }
  }
}
//立即调用一次
createBoard();

//根据当前轮到谁，给棋盘加上对应 class，让 CSS 知道虚影该用什么颜色
function updateTurnClass() {
  board.classList.toggle("black-turn", current === 1);
  board.classList.toggle("white-turn", current === 2);
}
updateTurnClass();   // 开局先设一次（黑棋）

//点击格子式执行
function handleClick(e) {
    if (gameOver) return;
    const cell = e.target;
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);

    //这一行已有，肢解返回
     if (boardState[r][c] !== 0) return;
     boardState[r][c] = current;
//画棋子
const stone = document.createElement("div");
stone.className = current === 1 ? "stone black" : "stone white";
cell.appendChild(stone);

//记录这一步，供悔棋使用（此时 current 还是刚落子的人）
history.push({ r, c, player: current, stone });

//高亮最近一首
if (lastStone) lastStone.classList.remove("last");
stone.classList.add("last");
lastStone = stone;
  
//检查有无五连
if (checkWin(r,c,current)) {
  info.textContent = (current === 1 ? "黑棋" : "白棋") + "获胜！🎉";
  gameOver = true;
  return;
}

//没赢，切换对方
   current = current === 1 ? 2 : 1;
   info.textContent = current === 1 ? "轮到黑棋" : "轮到白棋";
   updateTurnClass();   // 轮次变了，更新虚影颜色
}

/* 判断从 (r,c) 这颗刚落的棋，是否形成五连 */
function checkWin(r, c, player) {
  // 四个方向
  const directions = [
    [0, 1],  // 水平
    [1, 0],  // 垂直 
    [1, 1],  // 斜 
    [1, -1], // 斜 
  ];

  for (const [dr, dc] of directions) {
    let count = 1; // 包含刚落的这一颗

    // 沿正方向数
    count += countDir(r, c, dr, dc, player);
    // 沿反方向数
    count += countDir(r, c, -dr, -dc, player);

    if (count >= 5) return true;
  }
  return false;
}

/* 辅助函数：从 (r,c) 沿 (dr,dc) 方向，数连续同色棋子的个数 */
function countDir(r, c, dr, dc, player) {
  let n = 0;
  let nr = r + dr;
  let nc = c + dc;
  // 没越界、且颜色相同，就继续往这个方向走（注意判断和移动都用 nr/nc）
  while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && boardState[nr][nc] === player) {
    n++;
    nr += dr;
    nc += dc;
  }
  return n;
}

//悔棋
function undo() {
  if (history.length === 0) return;   // 没有棋可悔，直接退出

  // 如果之前有人赢了，悔棋应该让游戏可以继续
  gameOver = false;

  const move = history.pop();         // 取出并移除最后一步

  boardState[move.r][move.c] = 0;     // 1) 清空棋盘数据
  move.stone.remove();               // 2) 从页面删掉那颗棋子的 DOM

  current = move.player;             // 3) 轮次还给下这步的人

  // 4) 恢复高亮：把"最近一手"指向现在的新末尾
  if (lastStone) lastStone.classList.remove("last");
  if (history.length > 0) {
    lastStone = history[history.length - 1].stone;
    lastStone.classList.add("last");
  } else {
    lastStone = null;               // 全部悔完了，没有最近一手
  }

  info.textContent = current === 1 ? "轮到黑棋" : "轮到白棋";
  updateTurnClass();   // 轮次还原了，更新虚影颜色
}

//重新开始
function resetGame() {
  boardState = Array.from({ length: SIZE }, () => new Array (SIZE).fill(0))
  current = 1;
  gameOver = false;
  lastStone =null;
  history = [];   // 清空落子历史
  info.textContent = "黑棋先手";
  board.innerHTML = "";
  createBoard();
  updateTurnClass();   // 回到黑棋，更新虚影颜色
}
//绑定案件
const restarBtn = document.getElementById("restart");
restarBtn.addEventListener("click",resetGame);

const undoBtn = document.getElementById("undo");
undoBtn.addEventListener("click", undo);