import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


const lines = [[0,1,2], [3,4,5], [6,7,8], [0,4,8], [2,4,6], [0,3,6], [1,4,7], [2,5,8]];

function calculateWinner(squares) {
  for (let i=0; i<lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {return(squares[a]);}
  }
  return(null);
}


function getWinningSquares(squares) {
  for (let i=0; i<lines.length; i++) {
    const [a,b,c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {return(lines[i]);}
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
    for (let i=0; i<3; i++) {
      let squareRow = [];
      for (let j=0; j<3; j++) {
        squareRow.push(this.renderSquare(3*i + j));
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
        {squares: Array(9).fill(null)}
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
        for (let i=0; i<9; i++) {
          if (history[move-1].squares[i] === null && history[move].squares[i] !== null) {
            action = history[move].squares[i] + '[' + (i%3 + 1) + ', ' + Math.floor(i/3 + 1) + ']';
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
