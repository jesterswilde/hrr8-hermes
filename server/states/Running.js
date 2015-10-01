function Running() {
  this.name = "running";
  this.isRunning = false; 
  this.isBoosting = false; 
}
Running.prototype._input = function(inputObj){
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
Running.prototype.run = function(robot, parsedInput) {
  var currentAccl;
  if (parsedInput[0] === 0) {
    robot.velocity -= robot.velocity * robot.speedDecay * robot.delta.deltaValue / 1000;
    if (robot.velocity < 0.05) {
      robot.velocity = 0; 
    }
  } else {
    currentAccl = parsedInput[0] * robot.accelerationForward * robot.delta.deltaValue / 1000;
    robot.velocity += currentAccl; //velocity = velocity + accl
    if(robot.velocity >= robot.maxSpeed) {
      robot.velocity = robot.maxSpeed;
    }
  }
  
  robot.facing += parsedInput[1] * robot.turnSpeed * robot.delta.deltaValue / 1000;
  robot.forwardNormX = Math.sin(robot.facing * Math.PI * 2); 
  robot.forwardNormY = Math.cos(robot.facing * Math.PI * 2);
  //save this position before moving in case there is a collision
  robot.lastPosition.x = robot.position.x;
  robot.lastPosition.z = robot.position.z; 
  //advance position
  robot.position.x += robot.velocity * robot.forwardNormX;
  robot.position.z += robot.velocity * robot.forwardNormY;
};


Running.prototype.update = function(robot,inputObj){
  var parsedInput = this._input(inputObj); 
  this.run(robot, parsedInput); 
};

Running.prototype.enterState = function() {

};

Running.prototype.exitState = function() {

};

module.exports = Running;