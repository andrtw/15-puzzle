//matrix
var m = [];
var dim_max = 4;
//moves
var move = 0;
var seq = "12345678910111213141516";
var canKey = true;
//stopwatch
var h = 0, min = 0, sec = 0, dec = 0;
var display = "";
var stop = true;
var firstClick = false;

$(document).ready(function () {
  
  createTable();
  createMatrix();
  mixMatrix();
  
  $("td").click(function() {
    firstClick = true;
    var r = $(this).attr("id")[0];
    var c = $(this).attr("id")[2];
    
    if(firstClick)
      startStopwatch();
    lookAround(parseInt(r), parseInt(c), true);
  });
  
  $(this).keydown(function() {
    if(canKey) {
      canKey = false;
      var coord = new Array();
      coord = lookForWhatToMove(event.keyCode).split("$");
      if(coord != "") {
        var sixteen = coord[0];
        var toMove = coord[1];
        swap(sixteen[0],sixteen[2], toMove[0], toMove[2], true);
        win();
      }
    }
  }).keyup(function() {
    canKey = true;
  });
  
});

//========================
//== CREATION FUNCTIONS ==
//========================
// create the table with rows, columns and ordered images
function createTable() {
  $("#main").append("<table id='field'>");
  for (var r = 0; r < dim_max; r++) {
    $("#field").append("<tr id='r" + r + "'>");
    for (var c = 0; c < dim_max; c++) {
      //row
      $("#r" + r).append("<td id='" + r + "-" + c + "' align='center'>");
      //4 images per row
      $("#"+r+"-"+c).append("<img>");
      $("#"+r+"-"+c).children().attr("src", "images/" + (r*dim_max+(c+1)) + ".jpg");
      $("#"+r+"-"+c).children().attr("ondragstart", "return false;");
    }
  }
}
//create the matrix and fill it in ordered numbers
function createMatrix() {
  var num = 1;
  for (var i = 0; i < dim_max; i++) {
    m[i] = new Array(dim_max);
  }
  for (var r = 0; r < dim_max; r++) {
    for (var c = 0; c < dim_max; c++) {
      if (num == 17) return;
      else m[r][c] = num++;
    }
  }
}
/* end CREATION FUNCTIONS */

//update the table based on numbes into the matrix
function updateTable(m) {
  for (var r = 0; r < dim_max; r++) {
    for (var c = 0; c < dim_max; c++) {
      $("#"+r+"-"+c).children().attr("src", "images/" + m[r][c] + ".jpg");
    }
  }
}

//print out the matrix passed as parameter
function printMatrix(m) {
  for (var r = 0; r < dim_max; r++) {
    for (var c = 0; c < dim_max; c++) {
      $("#div").append(m[r][c] + ", ");
    }
    $("#div").append("<br />");
  }
  $("#div").append("<br />");
}

//look the surroundings of the clicked cell excluding diagonals
//player is true if the user clicked, false no effects
function lookAround(rr, cc, player) {
  for (var r = rr - 1; r <= rr + 1; r++) {
    for (var c = cc - 1; c <= cc + 1; c++) {
      // if row and col are included in the matrix boundary
      if (validate(r, c)) {
        if (r == rr && c == cc) continue;
        //check out diagonals
        if (r == rr-1 && c == cc-1) continue;
        if (r == rr+1 && c == cc+1) continue;
        if (r == rr-1 && c == cc+1) continue;
        if (r == rr+1 && c == cc-1) continue;
        else if(m[r][c] == 16) {
          swap(rr,cc, r,c, player);
          updateTable(m);
          if (player)
            win();
        }
      }
    }
  }
}

//look for empty cell 16, then choose what cell move based on the keypressed
function lookForWhatToMove(key) {
  var coord = "";
  for(var r = 0; r < dim_max; r++) {
    for(var c = 0; c < dim_max; c++) {
      if(m[r][c] == 16) {
        //console.log(key);
        switch(key) {
          //a, left
          case 65:
          case 37: if(validate(r, c+1)) coord = r+";"+c +"$"+ r+";"+(c+1); break;
          //w, up
          case 87:
          case 38: if(validate(r+1, c)) coord = r+";"+c +"$"+ (r+1)+";"+c; break;
          //d, right
          case 68:
          case 39: if(validate(r, c-1)) coord = r+";"+c +"$"+ r+";"+(c-1); break;
          //s, down
          case 83:
          case 40: if(validate(r-1, c)) coord = r+";"+c +"$"+ (r-1)+";"+c; break;
        }
      }
    }
  }
  //what is coord?
  //coord = "emptyCellRow;emptyCellCol$foundCellRow;foundCellCol"
  return coord;
}

//check whether the cell of coordinale r,c is included in the matrix boundary
function validate(r, c) {
  if(r >= 0 && r < dim_max)
    if(c >= 0 && c < dim_max)
      return true;
  return false;
}

//swap coords into the matrix
function swap(r1, c1, r2, c2, player) {
  var delay = 150;
  var temp = m[r1][c1];
  //if the user clicks, then apply effect
  if (player) {
    /*
    effect:
      width and height +10px
      swap cells
      width and height back to default (75px)
    */
    $("#"+r1+"-"+c1).animate({
      width:"85px",
      height:"85px"
    }, delay);
    $("#"+r2+"-"+c2).animate({
      width:"65px",
      height:"65px"
    }, delay, function() {
      m[r1][c1] = m[r2][c2];
      m[r2][c2] = temp;
      $("#"+r1+"-"+c1).animate({
        width:"75px",
        height:"75px"
      }, delay);
      $("#"+r2+"-"+c2).animate({
        width:"75px",
        height:"75px"
      }, delay);
      
      //without this statement once the matrix is ordered (game completed) the users has to click
      //on cell 12 or 15 (the two in the surrounding of empty cell 16) to make win() fired
      if(win())
        lookAround(3,2,false);
      
      updateTable(m);
    });
    document.getElementById('num-moves').innerHTML = ++move;
  }
  //otherwise, no effect
  else {
    m[r1][c1] = m[r2][c2];
    m[r2][c2] = temp;
  }
}

//mix up the matrix
function mixMatrix() {
  do {
    for (var i = 0; i < 1000; i++) {
      var r = Math.floor(Math.random() * 4);
      var c = Math.floor(Math.random() * 4);
      lookAround(r, c, false);
    }
  }while(createStringFromMatrix(m) == seq);
}

//===================
//== WIN FUNCTIONS ==
//===================
function win() {
  if(createStringFromMatrix(m) == seq) {
    stopStopwatch();
    $("#field").hide();
    //$("#main").addClass("win");
    $("#main").css({"background-color": "#4FA048", "color": "white", "text-align": "center"});
    document.getElementById('main').innerHTML = "<h1>You won!</h1>";
  }
}
//create a string based on hte numbers into the matrix
function createStringFromMatrix(m) {
    var str = "";
    for (var r = 0; r < dim_max; r++) {
      for (var c = 0; c < dim_max; c++) {
        str += m[r][c];
      }
    }
    return str;
}
/* end WIN FUNCTIONS */

//=========================
//== STOPWATCH FUNCTIONS ==
//=========================
function startStopwatch() {
  if (stop) {
    stop = false;
    stopwatch();
  }
}
function stopStopwatch() {
  stop = true;
}
function stopwatch() {
  if (!stop) {
    dec++;
    if (dec > 9) {
      dec = 0;
      sec++;
    }
    if (sec > 59) {
      sec = 0;
      min++;
    }
    if (min > 59) {
      min = 0;
      h++;
    }
    print();
    setTimeout("stopwatch()", 100);
  }
}
function print() {
  if (h < 10) display = "0";
  display += h + ":";
  if (min < 10) display += "0";
  display += min + ":";
  if (sec < 10) display += "0";
  display += sec + "." + dec;
  document.getElementById('stopwatch').innerHTML = display;
}
/* end STOPWATCH FUNCTIONS */