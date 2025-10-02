var lastRightWord;
var bestPercent;
var bestWords;
var totalLettersGot;
var totalLetters;
var bestLetters;
var audio;
var correct_words = [];
var mainWord;
var index;
var input;
var word_index;
var count;
var game_words = [];
var word_groupings, word_groupings2;
var all_words;
var mode;
/**
 * Change size of dictionary
 * @param  e checked object to determine which state its in
 */
function toggle_size(e) {
    var disp = document.getElementById("dict_size");

    all_words = e.checked ? all_words_15K : all_words_178k;
    mode = e.checked ? "small" : "large";
    //show label with dictionary size:
    lenMsg = Math.round(all_words_15K.length / 1000) + "K";
    disp.innerHTML = e.checked
        ? "small word set (" + lenMsg + ")"
        : "large word set (178k)";

    //time to get a new word
    getWord();
}

/**
 * Gets an array of 26 counts of how many of each letter occur in the word
 * @param  w - the word
 * @returns array of counts
 */
function getAlphaList(w) {
    //letter count array:
    alpha = [];
    for (let index = 0; index < 26; index++) {
        alpha.push(0);
    }
    //count how many of each letter
    w = w.toLowerCase();
    for (i = 0; i < w.length; i++) {
        ascii = w.charCodeAt(i);
        index = ascii - 97;
        alpha[index]++;
    }
    return alpha;
}
function showDef(word) {
  const url = "https://www.merriam-webster.com/dictionary/" + word; // Replace with your desired URL
  const windowName = "smallWindow";
  const features = "width=400,height=600,resizable=yes,scrollbars=yes";
    console.log(url);
  window.open(url, windowName, features);
}

/**
 * displays all words not guessed by user
 */
function giveUp() {
    document.getElementById("msg").innerHTML = "";

    //set guess to blank string:
    input = document.getElementById("word-guess");
    input.value = "";

    //build up html message:
    msg2 = "";

    //sort alpha, then by word length:
    all_words.sort();
    all_words = all_words.sort((a, b) => a.length - b.length);

    wdCount = 0;
    wordLength2 = 1; //to insert new lines between word lists

    //get words not guessed:
    all_words.forEach((element) => {
        if (element.length > wordLength2 && element.length <= mainWord.length) {
            //new row for next longer words:
            wordLength2 = element.length;
            msg2 +=
                "<br><span class='word-length'>" + element.length + "</span>";
        }
        //if it's in the word and was not already guessed, add to list:
        if (check2(element) && !correct_words.includes(element)) {
            //  msg2 += "<a href='#' onclick='getDefinition(\"" + element + "\")'>"+ element + "</a>, ";
            msg2 +=
                "<span onclick=showDef('" + element + "')>" +element +
                "</span>, ";

            wdCount++;

         
        }
    });
    //show header for missed words:
    msg3 =
        "<div id='missed'><i>" +
        wdCount +
        " words you missed (" +
        (totalLetters - totalLettersGot) +
        " letters):</i>" +
        msg2.substring(0, msg2.length - 2);

    document.getElementById("allwords").innerHTML = msg3 + "</div>";
    lastRightWord = "";

    //determine if new high scores and show messages:
    if (typeof Storage !== "undefined") {
        //browser can do it
        if (localStorage.getItem("highPercentage")) {
            //exists a previous score
            //new high score:
            if (
                percentCorrect >
                parseFloat(localStorage.getItem("highPercentage"))
            ) {
                localStorage.setItem("highPercentage", "" + percentCorrect);
                bestPercent = parseFloat(
                    localStorage.getItem("highPercentage")
                );
                play();
                alert("New High Score: " + percentCorrect + "% !!!");
            }
        } //first time - no high score yet - will set to zero
        else {
            localStorage.setItem("highPercentage", "" + percentCorrect);
        }

        //letters:
        if (localStorage.getItem("highLetters")) {
            //exists a previous score
            //new high score:
            if (
                percentLetters > parseFloat(localStorage.getItem("highLetters"))
            ) {
                localStorage.setItem("highLetters", "" + percentLetters);
                bestletters = parseFloat(localStorage.getItem("highLetters"));
                alert("New High % of all letters: " + percentLetters + "% !!!");
            }
        } //first time - no high score yet - will set to zero
        else {
            localStorage.setItem("highLetters", "" + bestLetters);
        }
    }
}
/**
 * gets the word entered in the box
 * @param  e entry object to get word from

 */
function getEnteredWord(e) {
    var wordToCheck = e.target.value.toLowerCase();
    return wordToCheck;
}
/**
 * used to determine count of how many valid words for a given game word
 * @param  wordToCheck word to check if valid word for given game word
 * @return true if a valid word, false otherwise
 */
function check2(wordToCheck) {
    //no 1-letter words/can't use game word:
    if (wordToCheck.length == 1 || wordToCheck == mainWord) return false;

    //put both guess and game word letters into alpha order:
    alphaListGuess = getAlphaList(wordToCheck);
    alphaListWord = getAlphaList(mainWord);

    //check if any letter in guess appears more than in word:
    goodLetters = true;
    for (let index = 0; index < 26; index++) {
        if (alphaListGuess[index] > alphaListWord[index]) return false;
    }

    //check if in dictionary:
    inDictionary = false;
    all_words.forEach((element) => {
        if (wordToCheck === element) inDictionary = true;
    });

    if (!inDictionary) return false;

    return true;
}

var percentCorrect;
/**
 * Checks validity of word (not original word, > 1 char, not already used, in dictionary)
 * and sets message if not valid
 *
 * @param {word to check for validity} wordToCheck
 * @returns true if okay word, false otherwise
 */
function check(wordToCheck) {
    document.getElementById("instructions").style.display = "none";
    msg = "";
    //put both guess and game word letters into alpha order:
    alphaListGuess = getAlphaList(wordToCheck);
    alphaListWord = getAlphaList(mainWord);

    //check if any letter in guess appears more than in word:
    goodLetters = true;
    for (let index = 0; index < 26; index++) {
        if (alphaListGuess[index] > alphaListWord[index]) goodLetters = false;
    }
    //check if in dictionary:
    inDictionary = false;
    all_words.forEach((element) => {
        if (wordToCheck === element) inDictionary = true;
    });

    //invalid and valid word HTML:
    insert = "<span style='color:red'>" + wordToCheck + "</span>";
    insert2 =
        "<span style='color:#5CbF60'>" +
        wordToCheck +
        " is a VALID word!</span> ";

    //good word:
    if (
        goodLetters &&
        inDictionary &&
        wordToCheck != mainWord &&
        wordToCheck.length > 1 &&
        !correct_words.includes(wordToCheck)
    ) {
        document.getElementById("msg").innerHTML = insert2;
        correct_words.push(wordToCheck);
        lastRightWord = wordToCheck;
        totalLettersGot += wordToCheck.length;
        word_groupings2[wordToCheck.length]++;
    } //not good - show message:
    else if (!goodLetters)
        document.getElementById("msg").innerHTML =
            insert + " has invalid letters";
    else if (!inDictionary)
        document.getElementById("msg").innerHTML =
            insert + " is not in this dictionary";
    else if (wordToCheck == mainWord)
        document.getElementById("msg").innerHTML =
            insert + " is the same as game word";
    else if (correct_words.includes(wordToCheck))
        document.getElementById("msg").innerHTML = insert + " was already used";
    else document.getElementById("msg").innerHTML = "";

    //show all words guessed so far in alpha order:
    correct_words.sort();
    correct_words = correct_words.sort((a, b) => a.length - b.length);

    //show scores:
    percentCorrect = ((100 * correct_words.length) / count).toFixed(1);
    percentLetters = (100 * (totalLettersGot / totalLetters)).toFixed(1);

    //show counts of each word size:
    counts2 = "<span id='length-counts'><br>length (# words):<br> ";
    for (let index = 0; index < word_groupings2.length; index++) {
        const element = word_groupings[index] - word_groupings2[index];
        if (element != 0) counts2 += index + " (" + element + ") &nbsp";
    }
    counts2 = counts2.substring(0, counts2.length - 5);
    msg += counts2 + "<br></span>";

    //check if new high score:
    if (typeof Storage !== "undefined") {
        bp = percentCorrect > bestPercent ? percentCorrect : bestPercent;
        bl = percentLetters > bestLetters ? percentLetters : bestLetters;

        highScoreMsg =
            "<span style='font-size:15px;'>YOUR BEST:<span style='margin-left:50px'> " +
            bp +
            "</span>% <span style='margin-left:200px'>" +
            bl +
            "</span>%</span><br>";
    } else highScoreMsg = "";

    msg +=
        "<span id='high-scores'>" +
        correct_words.length +
        "<span style='font-size:24px'> words (" +
        percentCorrect +
        "%)</span>, " +
        totalLettersGot +
        " <span style='font-size:24px'> letters (" +
        percentLetters +
        "%)</span><br> " +
        highScoreMsg;

    //show all correct words in a list:
    wordLength = 1;
    correct_words.forEach((element) => {
        if (element.length > wordLength) {
            //time for a new row
                msg += "<br><span style='font-size: 20px;color:#41b6ff'>Click any word to see it's definition:</span>";

            wordLength = element.length;
            msg +=
                "<br><span style='font-size:20; color:gray;margin-right:10px;'>" +
                wordLength +
                "</span>";
                
        }
        //show most recent word in a different color:
        if (element === lastRightWord)
            msg +=
                "<span onclick='showDef(\"" + element + "\")' style='color:#41b6Ff;font-size:28px;'>" +
                element +
                ", </span>";
        else
            msg +=
                "<span  onclick='showDef(\"" + element + "\")' style='color:white;font-size:28px'>" +
                element +
                ", </span>";
    });
    document.getElementById("info").innerHTML = msg;

    //select box so user can type without clicking:
    input.focus();
    input.select();
    if (percentCorrect > 99.9) {
        alert("CONGRATULATIONS!!!!!!!!!!!!!!!!!!!!!!!!\n ===== 100 % =====");
        giveUp();
    }

    return (
        goodLetters &&
        inDictionary &&
        wordToCheck != mainWord &&
        wordToCheck.length > 1
    );
}

/**
 * count how many valid words can be made from gameword
 */
function setup() {
    count = 0;
    totalLetters = 0;

    word_groupings = new Array(20).fill(0);
    word_groupings2 = new Array(20).fill(0);
    game_words = [];

    //count words and total letters for all valid words from gameword:
    all_words.forEach((element2) => {
        if (check2(element2)) {
            count++;
            totalLetters += element2.length;
            game_words.push(element2);
            word_groupings[element2.length]++;
        }
    });
    //sort alphabetically and then by number of letters:
    game_words.sort();
    game_words = game_words.sort((a, b) => b.length - a.length);
}
/**
 * plays some music when a new high score is acheived
 */
function play() {
    var audio2 = document.getElementById("mySound");
    audio2.volume = 0.5;

    audio2.play();
}

/**
 * setup listener for ENTER = submit, and get game word
 */
function init() {
    all_words = all_words_178k;
    mode = "large";
    input = document.getElementById("word-guess");

    input.addEventListener("keydown", function (e) {
        input.style.fontSize = "40px";
        if (e.code === "Enter") {
            //checks whether the pressed key is "Enter"
            wd = getEnteredWord(e);
            check(wd);
        }
    });
    getWord();
    // alert("NEW FEATURE!!!  CLICK ANY WORD TO SEE IT'S DEFINITION! Works for..\n"+
    //     "- the main word\n- guessed words\n- missed words at the end"
    // )
    console.log("Small word set: " + all_words_15K.length);
}

/**
 * gets a valid word - >1 character, between 30 and 200 subwords, between 6 and 13 length
 */
function getWord() {
    document.getElementById("word").innerHTML =
        "(finding word within parameters...)";
    document.getElementById("allwords").innerHTML = "";
    document.getElementById("info").innerHTML = "";
    document.getElementById("msg").innerHTML = "";

    //reset all counters, etc. for new word:
    mainWord = "";
    index = 0;
    word_index = 0;
    correct_words = [];
    totalLettersGot = 0;
    totalLetters = 0;
    valid = false;
    //look for valid word
    while (!valid) {
        word_index = Math.floor(Math.random() * all_words.length);
        mainWord = all_words[word_index];
        if (mode === "small") {
            lowerBound = 15;
            smallestWord = 3;
        } else {
            smallestWord = 6;
            lowerBound = 30;
        }
        setup(); //gets a count of how many words can be made from this word
        if (
            count >= lowerBound &&
            count <= 200 &&
            mainWord.length >= smallestWord &&
            mainWord.length <= 13
        )
            valid = true;
    }
    //show counts of each word size:
    counts = document.getElementById("word").innerHTML = 
        "<span onclick='showDef(\""+ mainWord+ "\")'>" + mainWord + "</span> (" + count + ") </span>";

    //clear the entry box and put the focus back on it:
    input = document.getElementById("word-guess");
    input.focus();
    input.value = "";

    //check for high score in storage and display
    if (typeof Storage !== "undefined") {
        //browser can do it
        if (localStorage.getItem("highPercentage")) {
            //exists a previous score
            bestPercent = parseFloat(localStorage.getItem("highPercentage"));
        } else {
            bestPercent = 0.0;
        }
        if (localStorage.getItem("highLetters")) {
            //exists a previous score
            bestLetters = parseFloat(localStorage.getItem("highLetters"));
        } else {
            bestLetters = 0.0;
        }
    }
}
