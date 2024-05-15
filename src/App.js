import React, {useEffect, useState} from 'react'
import './App.css';

// all words for wordle
const wordlist = require("wordle-wordlist")

// board sizes: row ad column
const rowCount = 6
const colCount = 5

// qwerty keyboard letters
const keyboard = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function App() {
  const [allWords, setAllWords] = useState([])
  const [answer, setAnswer] = useState('')

  const [gameEnd, setGameEnd] = useState(false);

  const [activeRow, setActiveRow] = useState(0)
  const [activeCol, setActiveCol] = useState(0)

  const [wordsEntered, setWordsEntered] = useState([])
  const [boxColors, setBoxColors] = useState([]);

  // call when page loads
  useEffect(() => {
    // initialize entered words list
    const emptyWord = Array(colCount).fill("");
    const emptyWords = Array(rowCount).fill(emptyWord);
    setWordsEntered(emptyWords);

    // initialize box colors
    setBoxColors(Array(rowCount).fill(Array(colCount).fill("White-Backgroud")))

    // fetch all words and set answer word
    wordlist.all().then((words) => {
      setAllWords(words);
      let randomIndex = Math.floor(Math.random() * words.length);
      setAnswer(words[randomIndex]);
      console.log(`CORRECT ANSWER: ${words[randomIndex]}`);
    }).catch((e) => {
      console.log(e);
    });

    // focus on the first box
    document.getElementById("00").focus()
  }, [])

  // render input boxes UI
  const renderInputBoxes = () => {
    const rows = []
    for(let i = 0; i < rowCount; i++){
      const row = []
      for(let j = 0; j < colCount; j++){
        row.push(
          <input
            type="text"
            id={`${i}${j}`}
            key={`${i}${j}`}
            className={"Letter-Input-Box "+  ((boxColors[i] && boxColors[i][j]) ? boxColors[i][j] : "")}
            disabled={i !== activeRow}
            onChange={(e) => onChangeLetter(e.target.value, i, j)}
          />
        )
      }
      rows.push(<div key={i} className='Word-Row'>{row}</div>)
    }
    return rows;
  }

  // render keyboard UI
  const renderKeyboard = () => {
    return (
      <div className="Keyboard">
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="Keyboard-Row">
            {row.map((key, keyIndex) => (
              <div key={keyIndex} className="Keyboard-Key" onClick={() => handleOnKeyPress(key)}>
                {key}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // handle change on input boxes
  const onChangeLetter = (val, row, col) => {
    const updatedWordsEntered = [...wordsEntered].map((rowArray, rowIndex) => {
      if(rowIndex === row){
        const newRowArray = [...rowArray]
        newRowArray[col] = val.toUpperCase()
        return newRowArray
      }
      return rowArray
    })
    setWordsEntered(updatedWordsEntered)

    // focus on next input box
    if(col < colCount - 1){
      document.getElementById(`${row}${col+1}`)?.focus()
      setActiveCol(col)
    }
  }

  // handle keyboard key press
  const handleOnKeyPress = (key) => {
    const inputElement = document.getElementById(`${activeRow}${activeCol}`)

    if(inputElement){
      inputElement.value = key
      onChangeLetter(key, activeRow, activeCol)

      setActiveCol(c => c+1)
    }
  }

  // handle enter button
  const handleEnter = () => {
    if(wordsEntered[activeRow].includes("")){
      alert("Missing letters!")
      return;
    }
    else if(!allWords.includes(wordsEntered[activeRow].join("").toLowerCase())){
      alert("Not a valid word!")
      return;
    }
    // win the game
    else if(wordsEntered[activeRow].join("").toLowerCase() === answer){
      const updatedBoxColors = [...boxColors];
      updatedBoxColors[activeRow] = updatedBoxColors[activeRow].map((color, index) => (
        answer[index] === wordsEntered[activeRow][index].toLowerCase() ? "Green-Background" : (answer.includes(wordsEntered[activeRow][index].toLowerCase()) ? "Orange-Background" : "Gray-Background")
      ));
      setBoxColors(updatedBoxColors);

      setActiveRow(rowCount)

      setTimeout(() => {alert("You won the game!");}, 1000);
      return;
    }
    // lost the game
    else if(activeRow === rowCount-1){
      setGameEnd(true)
      setActiveRow(r => r+1)

      const updatedBoxColors = [...boxColors];
      updatedBoxColors[activeRow] = updatedBoxColors[activeRow].map((color, index) => (
        answer[index] === wordsEntered[activeRow][index].toLowerCase() ? "Green-Background" : (answer.includes(wordsEntered[activeRow][index].toLowerCase()) ? "Orange-Background" : "Gray-Background")
      ));
      setBoxColors(updatedBoxColors);

      setTimeout(() => {setGameEnd(true); alert("You lost the game!");}, 1000);
      return;
    }
    else{
      const updatedBoxColors = [...boxColors];
      updatedBoxColors[activeRow] = updatedBoxColors[activeRow].map((color, index) => (
        answer[index] === wordsEntered[activeRow][index].toLowerCase() ? "Green-Background" : (answer.includes(wordsEntered[activeRow][index].toLowerCase()) ? "Orange-Background" : "Gray-Background")
      ));
      setBoxColors(updatedBoxColors);

      setActiveRow(r => r+1)
      setActiveCol(0)

      // focus on the first input box of next row
      setTimeout(() => document.getElementById(`${activeRow + 1}0`)?.focus(), 1000);
    }
  }

  // handle new game button
  const handleNewGame = () => {
    window.location.reload()
  }

  // return UI
  return (
    <div className="App">
      <p className='Title'>Play WORDLE</p>
      <button className="New-Game-Button" onClick={handleNewGame}>New Game</button><br/><br/>
      { renderInputBoxes() }<br/><br/>
      { gameEnd && <p className='title' style={{color: "green"}}>{answer}</p>}
      { renderKeyboard() } <br/>
      { !gameEnd && <button className="Enter-Button" onClick={handleEnter}>Enter</button> }
    </div>
  );
}
