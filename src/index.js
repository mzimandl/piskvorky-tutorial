import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


const boardSize = 8;
const winLength = 5;  // be odd for symetry --*--
const winSides = Math.floor(winLength/2);

function calculateWinOffsets() {
  let horizontal = [];
  let vertical = [];
  let diagonal1 = [];
  let diagonal2 = [];

  for (let i = -winSides; i <= winSides; i++) {
    horizontal.push(i);
    vertical.push(i*boardSize);
    diagonal1.push(i*boardSize + i);
    diagonal2.push(i*boardSize - i);
  }

  return([horizontal, vertical, diagonal1, diagonal2]);
}
const [horizontal, vertical, diagonal1, diagonal2] = calculateWinOffsets();


function checkOffsets(i, j, squares, offsets) {
  let winning = true;
  for (const offsetValue of offsets) {
    if (squares[i*boardSize + j] !== squares[i*boardSize + j + offsetValue]) {winning = false;}
  }
  return(winning);
}

function calculateWinner(squares) {
  for (let i=0; i<boardSize; i++) {
    for (let j=0; j<boardSize; j++) {
      if (squares[i*boardSize + j]) {
        let relevantOffsets = [];
        if (winSides <= i < (boardSize - winSides)) {relevantOffsets.push(vertical);}
        if (winSides <= j < (boardSize - winSides)) {relevantOffsets.push(horizontal);}
        if ((winSides <= i < (boardSize - winSides)) && (winSides <= j < (boardSize - winSides))) {
          relevantOffsets.push(diagonal1);
          relevantOffsets.push(diagonal2);
        }
        for (const offsets of relevantOffsets) {
          if (checkOffsets(i, j, squares, offsets)) {return(squares[i*boardSize + j])}
        }
      }
    }
  }
  return(null);
}


function getWinningSquares(squares) {
  for (let i=0; i<boardSize; i++) {
    for (let j=0; j<boardSize; j++) {
      if (squares[i*boardSize + j]) {
        let relevantOffsets = [];
        if (winSides <= i < (boardSize - winSides)) {relevantOffsets.push(vertical);}
        if (winSides <= j < (boardSize - winSides)) {relevantOffsets.push(horizontal);}
        if ((winSides <= i < (boardSize - winSides)) && (winSides <= j < (boardSize - winSides))) {
          relevantOffsets.push(diagonal1);
          relevantOffsets.push(diagonal2);
        }
        for (const offsets of relevantOffsets) {
          if (checkOffsets(i, j, squares, offsets)) {
            let winningFields = [];
            for (const offsetValue of offsets) {
              winningFields.push(i*boardSize + j + offsetValue);
            }
            return(winningFields);
          }
        }
      }
    }
  }
  return(null);
}


function Square(props) {
  return (
    <button className='square' onClick={props.onClick} style={props.style}>
      <p className='button-text'>{'\u00A0'}{props.value}{'\u00A0'}</p>
    </button>
  )
}


class Board extends React.Component {
  
  renderSquare(i) {
    return (<Square key={i} value={this.props.squares[i]} style={this.props.winningSquares.includes(i) ? {backgroundColor: "red", color: "white"} : {backgroundColor: "white"}} onClick={() => (this.props.onClick(i))}/>);
  }

  createBoard() {
    let board = [];
    for (let i=0; i<boardSize; i++) {
      let squareRow = [];
      for (let j=0; j<boardSize; j++) {
        squareRow.push(this.renderSquare(boardSize*i + j));
      }
      board.push(<div key={i} className="board-row">{squareRow}</div>);
    }
    return board
  }

  render() {
    return (
      <div>{this.createBoard()}</div>
    )
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reversedHistory: false,
      stepNumber: 0,
      xIsNext: true,
      history: [
        {squares: Array(boardSize**2).fill(null)}
      ]
    }
  }

  handleClick(i) {
    let squares = this.state.history[this.state.stepNumber].squares.slice();
    if (calculateWinner(squares) || squares[i]) {return;}

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      stepNumber: this.state.stepNumber + 1,
      xIsNext: !this.state.xIsNext,
      history: this.state.history.slice(0, this.state.stepNumber + 1).concat([{squares: squares}])
    });
  }

  jumpTo(move) {
    this.setState({
      stepNumber: move,
      xIsNext: move % 2 === 0,
    });
  }

  render() {
    const history = this.state.history;
    const currentSquares = history[this.state.stepNumber].squares;
    const winner = calculateWinner(currentSquares);
    
    const moves = history.map((step, move) => {
      let action = null;
      if (move) {
        for (let i=0; i<currentSquares.length; i++) {
          if (history[move-1].squares[i] === null && history[move].squares[i] !== null) {
            action = history[move].squares[i] + '[' + (i%boardSize + 1) + ', ' + Math.floor(i/boardSize + 1) + ']';
          }
        }        
      }

      const desc = move ? 'Go to move #' + move + ': ' + action : 'Go to game start';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} style={this.state.stepNumber === move ? {fontWeight: "bold"} : {fontWeight: "normal"}}>
            {desc}
          </button>
        </li>
      );
    });

    let status;
    let winningSquares = [];
    if (winner) {
      status = 'Winner: ' + winner;
      winningSquares = getWinningSquares(currentSquares);
    } else if (!currentSquares.includes(null)) {
      status = 'This is a draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div>
        <div className="status"><h3>{status}</h3></div>
        <div className='game-board'>
          <Board onClick={(i) => (this.handleClick(i))} squares={currentSquares} winningSquares={winningSquares}/>
        </div>
        <div className='game-info'>
          <button onClick={() => (this.setState({reversedHistory: !this.state.reversedHistory}))}>Reverse history</button><br /><br />
          {this.state.reversedHistory ? moves.reverse() : moves}
        </div>
      </div>
    ); 
  }
}


ReactDOM.render(
  <Game />,
  document.getElementById("root")
);
