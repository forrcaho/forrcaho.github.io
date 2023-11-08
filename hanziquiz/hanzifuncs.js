// hanzifuncs.js    -*- mode: javascript; coding: utf-8 -*-
// version 0.3.1
// Copyright (C) 2003 by Forrest Cahoon (hanziquiz@abstractfactory.org)
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.

////////////////////////////////////////////////////////////////////////

var Qcat; // questions are of type Category[Qcat]
var Acat; // answer choices are of type Category[Acat]
var Qnum; // Question[Qnum] is displayed, then Qnum is incremented
var Numchoices = 5; // Number of choices displayed for each question

var Question = []; // an array of objects with this structure:
// Question[].deck_idx : index of Deck array for this question's Deck
// Question[].card : Card which is the correct answer
// Question[].choice[] : Array of Numchoices guesses

var Recent_answers = {}; // Store correct answers here while
// constructing the questions to avoid presenting them as choices in
// subsequent questions.  Structure:
// Recent_answers.deck : Array containing an array of recent answers
//                       for each deck (indexed by Deck array index)
// Recent_answers.max_length : Array containing the max number of
//                             recent answers to store for each deck
// Recent_answers.insert_point : Array containing, for each deck i,
//                               the index of Recent_answers.deck[i] to
//                               which the next answer should be written.

var Display = {}; // Contains the textNodes whose values
// we want to update:
// Display.question is the question textNode
// Display.choice[] is an array of the textNodes for the choices

var Starttime; // start time for timing stats
var Rightcount = 0,
  Wrongcount = 0; // right and wrong counts for stats
var Wronglist = []; // list of incorrectly guessed cards to
// display at the end of the quiz

////////////////////////////////////////////////////////////////////////

function setup() {
  var i;

  // Initialize Recent_answers
  Recent_answers.max_length = {};
  Recent_answers.insert_point = {};
  Recent_answers.deck = [];
  for (i = 0; i < Deck.length; i++) {
    Recent_answers.deck[i] = [];
    if (Deck[i].length < 2 * Numchoices) {
      alert(
        "Sorry, not enough questions have been provided\n" +
          "deck " +
          (i + 1) +
          " to run this program"
      );
      window.location = "about:blank"; // change to error page
    }
    Recent_answers.max_length[i] = Math.min(
      Math.round(Deck[i].length / 2),
      Deck[i].length - 2 * Numchoices
    );

    Recent_answers.insert_point[i] = 0;
  }

  // Build the selection lists for questions and answers

  var Qsel_list = document.getElementById("Qsel");
  var Asel_list = document.getElementById("Asel");

  var q_selected, a_selected;
  for (i = 0; i < Category.length; i++) {
    q_selected = i == Qsel_default_index;
    Qsel_list.options[i] = new Option(Category[i], "", q_selected, q_selected);

    a_selected = i == Asel_default_index;
    Asel_list.options[i] = new Option(Category[i], "", a_selected, a_selected);
  }
}

////////////////////////////////////////////////////////////////////////

function begin_quiz() {
  Qcat = document.getElementById("Qsel").selectedIndex;
  Acat = document.getElementById("Asel").selectedIndex;

  if (Qcat == Acat) {
    alert("The question and answer categories can't be the same!");
    window.location = "hanziquiz.html";
    return;
  }

  // Build the question <table>
  var table = document.getElementById("question");
  var tbody = document.createElement("tbody"); // IE requires this.
  var tr = document.createElement("tr");
  var td = document.createElement("td");
  td.className = Category[Qcat].replace(/\W/, "") + "_question";
  Display.question = document.createTextNode("");
  td.appendChild(Display.question);
  tr.appendChild(td);
  tbody.appendChild(tr);

  Display.choice = new Array();
  for (i = 0; i < Numchoices; i++) {
    tr = document.createElement("tr");
    td = document.createElement("td");
    var button = document.createElement("button");
    button.className = Category[Acat].replace(/\W/, "") + "_choice";
    Display.choice[i] = document.createTextNode("");
    button.appendChild(Display.choice[i]);
    button.name = i; // Set the name attribute to the array index so
    // the event handler can determine which button
    // was clicked.
    button.onclick = process_answer;
    td.appendChild(button);
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  buildQuestion();
  Qnum = 0;
  Starttime = new Date().getTime();

  display_question();

  document.getElementById("setup").style.display = "none";
  document.getElementById("question").style.visibility = "visible";
}

///////////////////////////////////////////////////////////////////

function buildQuestion() {
  var num = 0;
  for (var i = 0; i < Deck.length; i++) {
    for (var j = 0; j < Deck[i].length; j++) {
      Question[num] = new Object();
      Question[num].deck_idx = i;
      Question[num].card = Deck[i][j];
      num++;
    }
  }
  shuffle(Question);
  for (i = 0; i < Question.length; i++) {
    buildChoice(Question[i]);
  }
}

///////////////////////////////////////////////////////////////////

function in_recent_answers(answer, deck_idx) {
  for (var i = 0; i < Recent_answers.deck[deck_idx].length; i++) {
    if (answer == Recent_answers.deck[deck_idx][i]) return true;
  }
  return false;
}

///////////////////////////////////////////////////////////////////

function add_to_recent_answers(answer, deck_idx) {
  Recent_answers.deck[deck_idx][Recent_answers.insert_point[deck_idx]] = answer;
  Recent_answers.insert_point[deck_idx]++;
  if (
    Recent_answers.insert_point[deck_idx] >= Recent_answers.max_length[deck_idx]
  ) {
    Recent_answers.insert_point[deck_idx] = 0;
  }
}

///////////////////////////////////////////////////////////////////

function buildChoice(Q) {
  var allowed_choices = new Array();
  var i, j, k, test_card;

  j = 0;
  for (i = 0; i < Deck[Q.deck_idx].length; i++) {
    test_card = Deck[Q.deck_idx][i];
    if (
      !in_recent_answers(test_card, Q.deck_idx) &&
      Q.card[Qcat] != test_card[Qcat] &&
      Q.card[Acat] != test_card[Acat]
    ) {
      allowed_choices[j] = test_card;
      j++;
    }
  }

  Q.choice = new Array();
  Q.choice[0] = Q.card;
  for (i = 1; i < Numchoices; i++) {
    var good_choice = false;
    while (!good_choice) {
      Q.choice[i] =
        allowed_choices[Math.floor(Math.random() * allowed_choices.length)];
      good_choice = true;
      for (j = 1; j < i; j++) {
        if (Q.choice[i][Acat] == Q.choice[j][Acat]) {
          good_choice = false;
          break;
        }
      }
    }
    // remove the choice we just used from allowed_choices
    k = 0;
    while (allowed_choices[k] != Q.choice[i] && k < allowed_choices.length) k++;

    // Argh!  This should be a one-liner:
    //
    // if (k < allowed_choices.length) allowed_choices.splice(k,1);
    //
    // But NoooOOoo! Mac IE doesn't implement the splice method of
    // Array and *just*goes*into*outer*space* when you try to use it.
    //
    // We implement our own.  Thanks, Microsoft!

    while (k < allowed_choices.length - 2) {
      allowed_choices[k] = allowed_choices[k + 1];
      k++;
    }
    allowed_choices.length = k + 1;
  }
  shuffle(Q.choice);
  add_to_recent_answers(Q.card, Q.deck_idx);
}

///////////////////////////////////////////////////////////////////

function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 0.999));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

///////////////////////////////////////////////////////////////////

function time_stat_string() {
  var count = Qnum + 1;
  var usecs = new Date().getTime() - Starttime;
  return (
    count +
    " questions answered in " +
    Math.round(usecs / 100) / 10 +
    " seconds (" +
    Math.round(usecs / (100 * Rightcount)) / 10 +
    " secs/right answer)"
  );
}

///////////////////////////////////////////////////////////////////

function display_question() {
  var Q = Question[Qnum];

  Display.question.nodeValue = Q.card[Qcat];
  for (var i = 0; i < Numchoices; i++) {
    Display.choice[i].nodeValue = Q.choice[i][Acat];
  }
}

///////////////////////////////////////////////////////////////////

function process_answer(e) {
  if (!e) e = window.event; // IE event model

  var ansnum;
  if (e.target) {
    ansnum = e.target.name; // W3C event model
  } else {
    ansnum = e.srcElement.name; // IE event model
  }
  // We know choice[ansnum] was chosen, because that's how we set the
  // name attribute of the choice buttons.
  var Q = Question[Qnum];
  var right_or_wrong = document.getElementById("right_or_wrong");
  var correct_answer = document.getElementById("correct_answer");
  var right_count = document.getElementById("right_count");
  var wrong_count = document.getElementById("wrong_count");
  var time_stats = document.getElementById("time_stats");
  if (Display.choice[ansnum].nodeValue == Q.card[Acat]) {
    Rightcount++;
    right_or_wrong.style.color = "blue";
    right_or_wrong.firstChild.nodeValue = "Right";
    right_count.firstChild.nodeValue = Rightcount;
  } else {
    Wrongcount++;
    right_or_wrong.style.color = "red";
    right_or_wrong.firstChild.nodeValue = "Wrong";
    wrong_count.style.color = "red";
    wrong_count.firstChild.nodeValue = Wrongcount;
    Wronglist[Wronglist.length] = Q.card;
  }
  correct_answer.firstChild.nodeValue =
    "The correct " +
    Category[Acat] +
    " for " +
    Q.card[Qcat] +
    " is " +
    Q.card[Acat];
  time_stats.firstChild.nodeValue = time_stat_string();
  document.getElementById("score").style.visibility = "visible";
  if (Qnum < Question.length - 1) {
    Qnum++;
    display_question();
  } else {
    display_end_quiz();
  }
}

///////////////////////////////////////////////////////////////////

function display_end_quiz() {
  document.getElementById("question").style.display = "none";
  var endtable = document.getElementById("end_quiz");

  var tbody, tr, td, textnode, button;
  var cellwidth = 100.0 / Category.length + "%";

  tbody = document.createElement("tbody");
  tr = document.createElement("tr");
  td = document.createElement("td");
  td.colSpan = Category.length;

  if (Wronglist.length) {
    textnode = document.createTextNode("You missed:");
  } else {
    textnode = document.createTextNode(
      "Congratulations on your perfect score!"
    );
  }
  td.appendChild(textnode);
  tr.appendChild(td);
  tbody.appendChild(tr);

  for (var i = 0; i < Wronglist.length; i++) {
    tr = document.createElement("tr");
    if (i % 2 == 0) tr.style.backgroundColor = "#cccc99";
    for (var j = 0; j < Category.length; j++) {
      td = document.createElement("td");
      td.style.width = cellwidth;
      textnode = document.createTextNode(Wronglist[i][j]);
      td.appendChild(textnode);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  tr = document.createElement("tr");
  td = document.createElement("td");
  td.colSpan = Category.length;
  button = document.createElement("button");
  button.onclick = function () {
    window.location = "hanziquiz.html";
  };
  textnode = document.createTextNode("Try Again!");
  button.appendChild(textnode);
  td.appendChild(button);
  tr.appendChild(td);
  tbody.appendChild(tr);

  endtable.appendChild(tbody);

  endtable.style.visibility = "visible";
}

///////////////////////////////////////////////////////////////////
