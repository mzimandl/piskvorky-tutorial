import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Row, Col, Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';
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


function getRelevantOffsets(i, j) {
  let relevantOffsets = [];
  if (winSides <= i < (boardSize - winSides)) {relevantOffsets.push(vertical);}
  if (winSides <= j < (boardSize - winSides)) {relevantOffsets.push(horizontal);}
  if ((winSides <= i < (boardSize - winSides)) && (winSides <= j < (boardSize - winSides))) {
    relevantOffsets.push(diagonal1);
    relevantOffsets.push(diagonal2);
  }
  return(relevantOffsets);
}


function calculateWinner(squares) {
  for (let i=0; i<boardSize; i++) {
    for (let j=0; j<boardSize; j++) {
      if (squares[i*boardSize + j]) {
        const relevantOffsets = getRelevantOffsets(i, j);
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
        const relevantOffsets = getRelevantOffsets(i, j);
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
  let imageClass = "";
  if (props.value === "X") {imageClass = " pes"}
  else if (props.value === "O") {imageClass = " ruka"}

  return (
    <Col className={"square btn " + props.class + imageClass} onClick={props.onClick} style={{height: innerHeight/(boardSize + 1.2) + "px"}}></Col>
  )
}


class Board extends React.Component {
  
  renderSquare(i) {
    return (<Square key={i} value={this.props.squares[i]} class={this.props.winningSquares.includes(i) ? "btn-primary" : "btn-outline-primary"} onClick={() => (this.props.onClick(i))}/>);
  }

  createBoard() {
    let board = [];
    for (let i=0; i<boardSize; i++) {
      let squareRow = [];
      for (let j=0; j<boardSize; j++) {
        squareRow.push(this.renderSquare(boardSize*i + j));
      }
      board.push(<Row>{squareRow}</Row>);
    }
    return board
  }

  render() {
    return (<Container fluid={true}>{this.createBoard()}</Container>)
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyOpen: false,
      reversedHistory: true,
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

      const desc = move ? 'Tah #' + move + ': ' + action : 'Začátek hry';
      return (
        <DropdownItem key={move} onClick={() => this.jumpTo(move)} active={this.state.stepNumber === move ? true : false}>
          {desc}
        </DropdownItem>
      );
    });

    let status;
    let winningSquares = [];
    if (winner) {
      status = 'Vyhrál: ' + (winner ? 'Psí čumák' : 'Tišmajstr');
      winningSquares = getWinningSquares(currentSquares);
    } else if (!currentSquares.includes(null)) {
      status = 'Remíza!';
    } else {
      status = 'Hraje: ' + (this.state.xIsNext ? 'Psí čumák' : 'Tišmajstr');
    }

    return (
      <Container fluid={true}>
        <Board onClick={(i) => (this.handleClick(i))} squares={currentSquares} winningSquares={winningSquares}/>
        <Row>
          <Col className='d-flex'>
            <ButtonGroup>
              <Button color='info' className='arrow' onClick={() => this.jumpTo(0)}>&nbsp;&nbsp;&nbsp;&nbsp;</Button>
              <ButtonDropdown color='info' direction="up" isOpen={this.state.historyOpen} toggle={() => (this.setState({historyOpen: !this.state.historyOpen}))}>
                <DropdownToggle color='info' caret>Historie</DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => (this.setState({reversedHistory: !this.state.reversedHistory}))}>Obrátit pořadí</DropdownItem>
                  <DropdownItem divider/>
                  {this.state.reversedHistory ? moves.reverse() : moves}
                </DropdownMenu>
              </ButtonDropdown>
              <Button color='info' disabled>{status}</Button>
            </ButtonGroup>
          </Col>
        </Row>
      </Container>
    ); 
  }
}


ReactDOM.render(
  <Game />,
  document.getElementById("root")
);
