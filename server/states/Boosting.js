var settings = require('../robotModelSettings.js');

function Boosting() {
  this.name = "boosting";
  this.isRunning = false; 
  this.isBoosting = false; 
}
Boosting.prototype._input = function(inputObj){
  var x = 0;
  var z = 0;  
  x-=inputObj.KA ? inputObj.KA : 0; 
  x+=inputObj.KD ? inputObj.KD : 0; 
  z+=inputObj.KW ? inputObj.KW * 1 : 0;
  z-=inputObj.KS ? inputObj.KS * 0.6 : 0;
  var currentInput = []; 
  currentInput[0] = z; 
  currentInput[1] = x; 
  return currentInput; 
};
Boosting.prototype.run = function(robot, parsedInput) {
  var currentAccl;
  if (parsedInput[0] === 0) {
    robot.velocity -= robot.velocity * robot.speedDecay * robot.delta.deltaValue / 1000;
    if (robot.velocity < 0.05) {
      robot.velocity = 0; 
    }
  } else {
    currentAccl = parsedInput[0] *  settings.boostingAcclMultiplier * robot.accelerationForward * robot.delta.deltaValue / 1000;
    robot.velocity += currentAccl; //velocity = velocity + accl
    if(robot.velocity >= robot.maxBoostSpeed) {
      robot.velocity = robot.maxBoostSpeed;
    }
  }
  robot.facing += parsedInput[1] * robot.turnSpeed * robot.delta.deltaValue / 1000;
  robot.forwardNormX = Math.sin(robot.facing * Math.PI * 2); 
  robot.forwardNormY = Math.cos(robot.facing * Math.PI * 2);
  //save this position before moving in case there is a collision
  robot.lastPosition.addToTail({x: robot.position.x, z: robot.position.z});
  if(robot.lastPosition.length >= settings.savedPositions) {
    robot.lastPosition.removeHead();
  }


  //advance position
  robot.position.x += robot.velocity * robot.forwardNormX;
  robot.position.z += robot.velocity * robot.forwardNormY;
};


Boosting.prototype.update = function(robot,inputObj){
  if(!this.changeState(robot, inputObj)){
    var parsedInput = this._input(inputObj); 
    //deplete energy while boosting
    robot.decreaseEnergy(settings.boostingHealthDrain);
    this.run(robot, parsedInput); 

  }
};

Boosting.prototype.changeState = function(robot,inputObj){
  if(!inputObj['K ']){
    robot.setState('running'); 
    return true;
  }
  return false; 
};

Boosting.prototype.enterState = function(robot) {
  robot.startBoosting(); 
};

Boosting.prototype.exitState = function(robot) {
  robot.stopBoosting(); 
};

module.exports = Boosting;