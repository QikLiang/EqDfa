const radius = 60;
const alphabet = ["a", "b"];
const green  = "#0f0";
const yellow = "#ff0";
const red    = "#f00";

var getNewId = (function() {
  var id = 0;
  return function() {
    return id++;
  }
})();

class Point {
  constructor(x,y){
    this.x = x;
    this.y = y;
    this.id = getNewId();
    this.delta = {};
    this.accept = false;
  }

  overlapWith(x,y){
    return (this.x-x)**2 + (this.y-y)**2
            <= (radius*2)**2
  }

  clickedByPoint(x,y){
    return (this.x-x)**2 + (this.y-y)**2
            <= radius**2
  }

  deltaFilled(){
    return alphabet.every(letter => letter in this.delta);
  }

  toString(){
    return this.id;
  }
}

function newPointOverlap(x, y, points){
  return points.some(point => point.overlapWith(x,y));
}

function clearCanvas(canvas){
  canvas.getContext("2d")
    .clearRect(0,0,canvas.width, canvas.height);
}

function drawCircle(canvas, x, y, overlap){
  var context = canvas.getContext("2d");
  context.lineWidth = 3;
  if(overlap){
    context.fillStyle = red;
  } else {
    context.fillStyle = yellow;
  }
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2, true);
  context.fill();
}

function drawCircles(canvas, points){
  var context = canvas.getContext("2d");
  context.lineWidth = 3;
  points.forEach(p =>{
    context.beginPath();
    if(p.deltaFilled()){
      context.fillStyle = green;
    } else {
      context.fillStyle = yellow;
    }
    context.arc(p.x, p.y, radius, 0, Math.PI * 2, true);
    context.fill();
    context.stroke();
    if(p.accept){
      context.beginPath();
      context.arc(p.x, p.y, radius*1.3, 0, Math.PI * 2, true);
      context.stroke();
    }
  });
}

function drawTransitionLine(canvas, start, end){
  if(start instanceof Point){
    start = [start.x, start.y];
  }
  if(end instanceof Point){
    end = [end.x, end.y];
  }

  var context = canvas.getContext("2d");
  context.strokeStyle = "#000";

  //if the two points are the same
  if(start[0] === end[0] && start[1] && end[1]){
    //draw curve with its center away from center of canvas
    var curCen = [end[0]-canvas.width/2, end[1]-canvas.height/2];
    //prevent divide be zero
    curCen = curCen[0]==0 && curCen[1]==0 ? [1,0] : curCen;
    //scale curCen to length of radius
    var mag = radius / Math.sqrt(curCen[0]**2 + curCen[1]**2);
    curCen = curCen.map(x => x*mag);
    var angle = Math.atan2(-curCen[1],-curCen[0]);
    context.beginPath();
    context.arc(end[0]+curCen[0], end[1]+curCen[1],
      radius, angle-Math.PI/3, angle-Math.PI*5/3,true);
    context.stroke();
    return;
  }

  var dx = end[0] - start[0];
  var dy = end[1] - start[1];

  //if two points are too close together, don't draw so
  //the arrow won't be on top of the circle
  if(dx**2 + dy**2 <= (radius*2)**2){
    return;
  }

  var mag = Math.sqrt(dx**2 + dy**2);
  //perpendicular offshift
  var perpMag = radius/2/mag;
  var shiftPerp = [-dy*perpMag, dx*perpMag];
  //parallel offshift
  //since mag*perpMag == radius/2, perpMag == paraMag
  var paraMag = Math.sqrt(radius**2 - (mag*perpMag)**2) / mag;
  var shiftPara = [dx*paraMag, dy*paraMag];

  context.beginPath();
  //main line
  context.moveTo(start[0]+shiftPerp[0]+shiftPara[0],
                  start[1]+shiftPerp[1]+shiftPara[1]);
  lineEnd = [end[0]+shiftPerp[0]-shiftPara[0],
              end[1]+shiftPerp[1]-shiftPara[1]];
  context.lineTo(lineEnd[0], lineEnd[1]);
  //arrow
  context.lineTo(lineEnd[0] - shiftPara[0]*0.5 + shiftPerp[0]*0.4,
        lineEnd[1] - shiftPara[1]*0.5 + shiftPerp[1]*0.4);
  context.moveTo(lineEnd[0], lineEnd[1]);
  context.lineTo(lineEnd[0] - shiftPara[0]*0.5 - shiftPerp[0]*0.4,
        lineEnd[1] - shiftPara[1]*0.5 - shiftPerp[1]*0.4);
  context.stroke();
}

function drawTransitionLetters(canvas, start, end, letters){
  if(start instanceof Point){
    start = [start.x, start.y];
  }
  if(end instanceof Point){
    end = [end.x, end.y];
  }

  var context = canvas.getContext("2d");
  context.font = "30px Arial";
  context.fillStyle = "#000";

  //if the two points are the same
  if(start[0] === end[0] && start[1] && end[1]){
    //draw curve with its center away from center of canvas
    var curCen = [end[0]-canvas.width/2, end[1]-canvas.height/2];
    //prevent divide be zero
    curCen = curCen[0]==0 && curCen[1]==0 ? [1,0] : curCen;
    //scale curCen to length of radius
    var mag = 2.2*radius / Math.sqrt(curCen[0]**2 + curCen[1]**2);
    curCen = curCen.map(x => x*mag);
    var textShift = curCen[0] / 2.2 / radius;
    textShift = (-textShift+1) / 2;
    textShift *= context.measureText(letters).width;
    context.fillText(letters, end[0] + curCen[0] - textShift,
                    end[1] + curCen[1] + 10);
    return;
  }

  var midX = (start[0] + end[0]) / 2;
  var midY = (start[1] + end[1]) / 2;
  var dx = end[0] - start[0];
  var dy = end[1] - start[1];
  var mag = radius * 0.7 / Math.sqrt(dx**2 + dy**2);
  //perpendicular offshift
  var shiftPerp = [-dy*mag, dx*mag];

  var textShift = dy>0 ? context.measureText(letters).width : 0;
  context.fillText(letters, midX + shiftPerp[0] - textShift,
                    midY + shiftPerp[1] + 10);
}

function drawDiagram(canvas, points){
  clearCanvas(diagram);
  drawCircles(canvas, points);

  var pointMap = {}
  points.forEach(p => {
    var idToLetters = {};
    for (let letter in p.delta){
      var val = p.delta[letter];
      pointMap[val.id] = val;
      if(val in idToLetters){
        idToLetters[val].add(letter);
      } else {
        idToLetters[val] = new Set([letter]);
      }
    }

    for (let id in idToLetters){
      var dest = pointMap[id];
      drawTransitionLine(diagram, p, dest);
      var letters = Array.from(idToLetters[id]).join();
      drawTransitionLetters(canvas, p, pointMap[id], letters);
    }
  })

  if (initState !== null){
    var context = canvas.getContext("2d");
    context.font = "30px Arial";
    context.fillStyle = "#000";
    context.fillText("START", initState.x-48, initState.y+10);
  }
}

//variables used by setDelta, set by canvas.mouseup on new_transition
var transitionFrom = null;
var transitionTo = null;
var points = []
var diagram;
function setDelta(letter){
  if(letter === "a" || letter === "s"){
    transitionFrom.delta["a"] = transitionTo;
  }
  if(letter === "b" || letter === "s"){
    transitionFrom.delta["b"] = transitionTo;
  }
  document.getElementById("select_mask").style.display = "none";
  drawDiagram(diagram, points);
}

function showMessage(message){
  var el = document.createElement("div");
  var text = document.createTextNode(message);
  el.appendChild(text);
  el.classList.add("message");

  document.getElementsByTagName("body")[0].appendChild(el);
}

function handleSubmition(result) {
  result = JSON.parse(JSON.parse(result));
  if(result === null){
    document.getElementById("won_mask").style.display = "flex";
  } else {
    showMessage('Answer incorrect. Shortest counter-example: "'
                + result + '"');
  }
}

//variables used by submitDfa, set by canvas mouse events
var initState = null;
//points, also used by setDelta
function submitDfa(){
  if (points.length==0 || !points.every(p => p.deltaFilled())){
    showMessage("Not a valid DFA!!");
    return;
  }

  //convert to json format
  var delta = {};
  for (let point of points){
    delta[point.id] = {};
    for (let letter in point.delta){
      delta[point.id][letter] = point.delta[letter].id.toString();
    }
  }
  var data = {"delta":delta,
              "init":initState.id.toString(),
              "accept":points.filter(p=>p.accept)
                              .map(p=>p.id.toString()) };
  data = JSON.stringify(data);

  //submit it using Ajax request
  var request = new XMLHttpRequest()
  var level = document.getElementById("level").textContent;
  request.open("POST", "/checkanswerapi/level" + level);
  request.addEventListener("load",
    function() {
      handleSubmition(this.responseText)
    });
  console.log(data);
  request.send(data);
}

//for debugging what regions can't have a new point be placed
function showOverlapGrid(canvas,points){
  var context = canvas.getContext("2d");
  context.beginPath();
  for(let i=0; i<canvas.width; i+=10){
    for(let j=0; j<canvas.height; j+=10){
      if(!newPointOverlap(i,j,points)){
        context.arc(i,j,10,0,Math.PI*2, true);
      }
    }
  }
  context.fill();
}

function buttonSelection(buttonId){
  return document.getElementsByClassName("button_on")[0].id;
}

window.addEventListener("load", function() {
  diagram = document.getElementById("states");
  diagram.width = window.innerWidth;
  diagram.height = window.innerHeight;
  var diaContext = diagram.getContext("2d");

  var input = document.getElementById("input");
  input.width = window.innerWidth;
  input.height = window.innerHeight;
  var inpContex = input.getContext("2d");

  var clicking = false;
  var reselect = false;
  var startPoint = null;
  input.addEventListener("mousedown", event => {
    var x = event.clientX;
    var y = event.clientY;
    var selected = points.filter(p => p.clickedByPoint(x,y));
    switch (buttonSelection()){
      case "new_state":
        clicking = true;
        drawCircle(input, x, y,
          points.filter(p => p.overlapWith(x,y)).length>0);
        break;
      case "move_state":
        if(selected.length != 1){
          break;
        }
        startPoint = selected[0];
        clicking = true;
        break;
      case "remove_state":
        if(selected.length == 1){
          selected = selected[0];
        } else {
          break;
        }
        //take selected out of transitions
        points.forEach(
          p => Object.keys(p.delta).forEach(
            key => {
              if(p.delta[key] === selected){
                delete p.delta[key];
              }
        }));
        points = points.filter(p => !p.overlapWith(x,y));
        initState = initState===selected ? null : initState;
        drawDiagram(diagram, points);
        break;
      case "new_transition":
        //if startPoint is already selected in previous click
        if(startPoint != null){
          break;
        }
        if (selected.length == 1){
          clicking = true;
          startPoint = selected[0];
        } else {
          startPoint = null;
        }
        break;
      case "mark_accept_state":
        if(selected.length == 1){
          selected[0].accept = ! selected[0].accept;
          drawDiagram(diagram, points);
        }
    }
  });

  input.addEventListener("mousemove", event => {
    if(!clicking){
      return;
    }

    var x = event.clientX;
    var y = event.clientY;
    var selected = points.filter(p => p.clickedByPoint(x,y));
    switch(buttonSelection()){
      case "new_state":
        clearCanvas(input);
        drawCircle(input, x, y,
          points.filter(p => p.overlapWith(x,y)).length>0);
        break;
      case "move_state":
        if(!clicking){
          break;
        }
        startPoint.x = x;
        startPoint.y = y;
        drawDiagram(diagram, points);
        break;
      case "new_transition":
        clearCanvas(input);
        //if mouse ever exits startPoint, it's a drag or reselect
        if(selected.length != 1 || selected[0] !== startPoint){
          reselect = true;
        }
        if(selected.length != 1){
          drawTransitionLine(input, startPoint,[x,y]);
        } else {
          //don't draw transition if mouse stays in same circle
          if(!reselect && startPoint===selected[0]) {
            break;
          }
          drawTransitionLine(input, startPoint,selected[0]);
        }
    }
  });

  input.addEventListener("mouseup", event => {
    clicking = false;
    clearCanvas(input);

    var x = event.clientX;
    var y = event.clientY;
    switch(buttonSelection()){
      case "new_state":
        if(!newPointOverlap(x,y,points)){
          var newPoint = new Point(x,y);
          initState = initState===null ? newPoint : initState;
          points.push(newPoint);
          drawDiagram(diagram,points);
        }
        break;
      case "move_state":
        startPoint = null;
        break;
      case "new_transition":
        if(startPoint === null){
          break;
        }
        var curPoint = points.filter(p => p.clickedByPoint(x,y));
        if(curPoint.length == 1){
          curPoint = curPoint[0];
          //if stay in same point, it's tap instead of drag
          //but mark the next click as reselect
          if(curPoint === startPoint && !reselect) {
            reselect = true;
            break;
          }
          drawTransitionLine(diagram,startPoint,curPoint);
          transitionFrom = startPoint;
          transitionTo = curPoint;
          document.getElementById("select_mask").style.display = "flex";
          reselect = false;
          //reset startPoint when line drawn
        }
        startPoint = null;
    }
  });
});

function buttonClicked(id) {
  Array.from(document.getElementsByClassName("button"))
    .forEach(
      button => {
        if (button.classList.contains("button_on")){
          button.classList.remove("button_on");
          button.classList.add("button_off");
        }
      }
    );
  var button = document.getElementById(id);
  button.classList.add("button_on");
  button.classList.remove("button_off");
}
