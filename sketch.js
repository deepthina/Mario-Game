var mario, marioAnimation, marioCollided;
var ground, groundImage;
var bck, bckImage;
var obstacleImage;
var bricks, bricksImage;

var PLAY = 1;
var END = 0;
var gameState = PLAY;

var bricksGroup, obstaclesGroup , invisibleLineGroup;

var score = 0;

var restart,restartImage,gameOver, gameOverImage;

var dieSound,jumpSound,checkPointSound;

//local storage of scores in case user opts to restart
localStorage["HighestScore"]=0;

//**************function preload() - starts here****************//

function preload() {
  //Loads Animation for Mario
  marioAnimation = loadAnimation("mario00.png", "mario01.png", "mario02.png", "mario03.png");
  //Loads Image for ground;
  groundImage = loadImage("ground2.png");
  //Loads Image for background
  bckImage = loadImage("bg.png");

  //Loads Animation for obstacles
  obstacleImage = loadAnimation("obstacle1.png", "obstacle2.png", "obstacle3.png", "obstacle1.png");

  //Loads Image for bricks
  bricksImage = loadImage("brick.png");

  //Loads animation for Mario when it collides obstacle
  marioCollided = loadAnimation("collided.png");

  //Load image for restart and game over
  restartImage= loadImage("restart.png");
  gameOverImage = loadImage("gameOver.png");
  
  //Load sounds
  jumpSound= loadSound("jump.mp3");
  dieSound= loadSound("die.mp3");
  checkPointSound = loadSound("checkPoint.mp3");
}
//**************function preload() - ends here****************//

//**************function setup() - starts here****************//

function setup() {
  //Creates canvas
  createCanvas(600, 300);

  //Create background object and add image and scale the image
  bck = createSprite(300, 200, 600, 600);
  bck.addImage("background", bckImage);
  bck.scale = 1.1;

  //Create mario object , add animation and scale it up
  mario = createSprite(50, 280, 20, 20);
  mario.addAnimation("mario", marioAnimation);
  mario.addAnimation("mario_collision", marioCollided);
  mario.scale = 1.5;
  // mario.debug=true;
  //Set collider to make Mario stand on the ground
  mario.setCollider("circle", 0, 0, 17);

  //Create ground object and add image
  ground = createSprite(0, 290, 600, 5);
  ground.addImage("ground", groundImage);

  //Create group for obstacles, bricks and invisibleLine
  obstaclesGroup = new Group();
  
  bricksGroup = new Group();
  invisibleLineGroup= new Group();           
  
   //Create gameOver object, add Image, scale down. Keep it invisible.
  gameOver = createSprite(300,150,10,10);
  gameOver.addImage("gameover",gameOverImage);
  gameOver.scale=0.5;
  gameOver.visible= false;
  
   //Create restart object, add Image, scale down. Keep it invisible.
  restart = createSprite(300,185,10,10);
  restart.addImage("restart",restartImage);
  restart.scale=0.5;
  restart.visible= false;
}

//**************function setup() - ends here****************//

//**************function draw() - starts here****************//
function draw() {

  //Clears background
  background("lightblue");


//**************Game state - play starts here****************//
  if (gameState === PLAY) {
    //Code to help Mario stop on bricks
    if(mario.isTouching(invisibleLineGroup)){
      mario.velocityY=0;
    }

    //Increase score based on frameRate. Current getFrameRate()~30
    
    score = score + Math.round(getFrameRate() / 30);

    //If Mario touches obstacles, end the game with sound
    if (mario.isTouching(obstaclesGroup)) {
      dieSound.play();
      gameState = END;
    }

    //Make the Mario jump when user presses space.mario.y > 200 ensures Mario is on ground.Play sound when jumps. 
    if (keyDown("space") && mario.y > 200) {
      mario.velocityY = -10;
      jumpSound.play(); 
    }

    //Add gravity
    mario.velocityY = mario.velocityY + 0.8;

    //Game adaptibility. Increase ground velocity with score 
    ground.velocityX = -(4+score/100);

    //Reset ground
    if (ground.x < 0) {
      ground.x = ground.width / 2;
    }
    
    //Play sound when user scores multiples of 100
    if(score >0 && score % 100 ===0){
      checkPointSound.play();
    }

    //Spawn obstacles and bricks
    spawnObstacles();

    spawnBricks();

  }
  
  //**************Game state - PLAY ends here****************//
  
  //**************Game state - END starts here****************//
  else if (gameState === END) {

    //Chane animation of Mario to die
    mario.changeAnimation("mario_collision", marioAnimation);

    //Stop ground and Mario
    ground.velocityX = 0;
    mario.velocityY = 0;

    //Stop bricks, obstacles and invisible line
    bricksGroup.setVelocityXEach(0);
    obstaclesGroup.setVelocityXEach(0);
    invisibleLineGroup.setVelocityXEach(0);

    //Make bricks, obstacles and invisible never disapper(only in END)
    bricksGroup.setLifetimeEach(-1);
    obstaclesGroup.setLifetimeEach(-1);
    invisibleLineGroup.setLifetimeEach(-1);
    
    //Make the images gameOver and restart- visible
    gameOver.visible= true;
    restart.visible= true;
    
    //Reset the game when mouse is pressed
    if(mousePressedOver(restart)){
    reset();
    }
  }
//**************Game state - END ends here****************//
  //Make Mario collide over the ground
  mario.collide(ground);

  //Display the objects
  drawSprites();

  //DIsplay score
  fill("black");
  textSize(20);
  text("Score: " + score, 460, 20);
}

//**************function draw() - ends here****************//

//^^^^^^^^^^function spawnObstacles() - start here^^^^^^^^^^//
function spawnObstacles() {
  //Spawn obstacles for every 100 frames as its spawing for every frame
  if (frameCount % 100 === 0) {
    //create obstacle object, give velocity.
    var obstacles = createSprite(600, 230, 10, 10);
    obstacles.velocityX = -(4+score/100);
    //Lifetime to avoid memory leak
    obstacles.lifetime = 600 / 4;
    //Add Animation
    obstacles.addAnimation("obstacle", obstacleImage);
    //Add to the group
    obstaclesGroup.add(obstacles);
  }
}
//^^^^^^^^^^function spawnObstacles() - end here^^^^^^^^^^//

//^^^^^^^^^^function spawnBricks() - start here^^^^^^^^^^//
function spawnBricks() {
  //Spawn bricks for every 50 frames as its spawing for every frame
  if (frameCount % 50 === 0) {
    //Create bricks object
    var bricks = createSprite(600, 100, 10, 10);
    //Create invisible object on top of bricks. This will ensure Mario is standing on it.
    var invisibleLine = createSprite(600,100,30,10);
    
    //Give velocity, lifetime and add to group for bricks. Assign the same to invisible line
    bricks.velocityX = -5;
    invisibleLine.velocityX= bricks.velocityX;
    
    bricks.lifetime = 600 / 5;
    invisibleLine.lifetime = 600 / 5;

    bricks.addImage("bricks", bricksImage);
    
    bricks.y = random(100, 200);
    invisibleLine.y=bricks.y-8;
    
    bricksGroup.add(bricks);
    invisibleLineGroup.add(invisibleLine);
    
    //Make line invisible
    invisibleLineGroup.setVisibleEach(false);
    
    //As Mario is getting created first, depth of this will be less. Assign in such a way the Mario's depth is always greater than bricks.
    bricks.depth = 1;
    invisibleLine.depth = 1;
    mario.depth = 2;

  }
}
//^^^^^^^^^^function spawnBricks() - ends here^^^^^^^^^^//
//^^^^^^^^^^function reset() - start here^^^^^^^^^^//

function reset(){
  //Restart the game to PLAY
  gameState= PLAY;
  //Change back to old animation
  mario.changeAnimation("mario", marioCollided);
  
  //Destroy all the groups as it still exists. (We have set lifetime =-1)
  obstaclesGroup.destroyEach();
  bricksGroup.destroyEach();
  invisibleLineGroup.destroyEach();
  
  //Make the gameOver and restart image invisible
  gameOver.visible= false;
  restart.visible= false;
  
  //If current score is greater than previous score, then store this in memory.
  if(localStorage["HighestScore"] < score){
    localStorage["HighestScore"] = score;
  }
  
  console.log(localStorage["HighestScore"]);
  //Reset score to 0
  score=0;
}

//^^^^^^^^^^function reset() - ends here^^^^^^^^^^//