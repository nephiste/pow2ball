//SuikaGame+2048 using Matter.js

//import Matter from 'matter-js';
const { Engine, Render, Runner, Bodies, World, Body, Sleeping, Events } =
  Matter;
//define engine and renderer
const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.getElementById('game-container'),
  options: {
    wireframes: false,
    background: '#F7F4C8',
    width: 620,
    height: 850,
  },
});

//define world
const world = engine.world;

//list of possible fruits (balls with numbers in this case)
const FRUITS = [
  {
    label: 'cherry',
    radius: 40 / 2,
    color: '#F20306',
    score: 2,
    text: '2',
  },
  {
    label: 'strawberry',
    radius: 50 / 2,
    color: '#FF624C',
    score: 4,
    text: '4',
  },
  {
    label: 'grape',
    radius: 72 / 2,
    color: '#A969FF',
    score: 8,
    text: '8',
  },
  {
    label: 'kumkwat',
    radius: 85 / 2,
    color: '#FFAF02',
    score: 16,
    text: '16',
  },
  {
    label: 'orange',
    radius: 106 / 2,
    color: '#FC8611',
    score: 32,
    text: '32',
  },
  {
    label: 'apple',
    radius: 140 / 2,
    color: '#F41615',
    score: 64,
    text: '64',
  },
  {
    label: 'pear',
    radius: 160 / 2,
    color: '#FDF176',
    score: 128,
    text: '128',
  },
  {
    label: 'peach',
    radius: 196 / 2,
    color: '#FEB6AC',
    score: 256,
    text: '256',
  },
  {
    label: 'pineapple',
    radius: 220 / 2,
    color: '#F7E608',
    score: 512,
    text: '512',
  },
  {
    label: 'melon',
    radius: 270 / 2,
    color: '#89CE13',
    score: 1024,
    text: '1024',
  },
  {
    label: 'watermelon',
    radius: 300 / 2,
    color: '#26AA1E',
    score: 2048,
    text: '2048',
  },
];

//define walls and ground
const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: {
    fillStyle: '#E5B253',
  },
});
const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: '#E5B253',
  },
});
const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: {
    fillStyle: '#E5B253',
  },
});
//define top line to end the game if any fruit goes above it
const topLine = Bodies.rectangle(310, 150, 620, 2, {
  isStatic: true,
  isSensor: true,
  render: { fillStyle: '#E5B253' },
  label: 'topLine',
});

//add all bodies (game board) to the world
World.add(world, [ground, leftWall, rightWall, topLine]);
Render.run(render);
Runner.run(engine);

//define current fruit regarding matter.js
let currentBody = null;
//define current fruit regarding FRUITS array
let currentFruit = null;

//disable action when a fruit is falling
let disableAction = false;

//scale the fruits based on the screen size
function scaleFruitSizes(scaleFactor) {
  FRUITS.forEach((fruit) => {
    fruit.scaledRadius = fruit.radius * scaleFactor;
  });
}

//define and update score
let score = 0;
function updateScore(points) {
  score += points;
  document.getElementById('score-display').innerText = `Score: ${score}`;
}

//define and update high score, store it in cache
let highScore = localStorage.getItem('highScore') || 0;
updateHighScoreDisplay();

function updateHighScoreDisplay() {
  document.getElementById(
    'high-score-display'
  ).innerText = `High Score: ${highScore}`;
}

//add a random fruit to the world
function addCurrentFruit() {
  const randomFruit = getRandomFruit();

  const body = Bodies.circle(300, 50, randomFruit.scaledRadius, {
    // Use scaledRadius
    label: randomFruit.label,
    isSleeping: true,
    render: {
      fillStyle: randomFruit.color,
    },
    restitution: 0.2,
    text: randomFruit.text,
  });

  currentBody = body;
  currentFruit = randomFruit;

  World.add(world, body);
}

//get a random fruit from the FRUITS array
function getRandomFruit() {
  const randomIndex = Math.floor(Math.random() * 5);
  const fruit = FRUITS[randomIndex];

  if (currentFruit && currentFruit.label === fruit.label)
    return getRandomFruit();

  return fruit;
}

//adjust screen size for mobile
function adjustGameForMobile() {
  const gameContainer = document.getElementById('game-container');
  const maxGameWidth = 620; // Design width of the game
  const gameHeight = window.innerHeight * 0.85;

  let gameWidth = window.innerWidth;
  if (gameWidth > maxGameWidth) {
    gameWidth = maxGameWidth;
  }

  // Calculate the scale factor based on current width vs design width
  const scaleFactor = gameWidth / maxGameWidth;

  // Update render dimensions
  render.canvas.width = gameWidth;
  render.canvas.height = gameHeight;
  render.options.width = gameWidth;
  render.options.height = gameHeight;

  // Scale and position static bodies
  Body.setPosition(ground, {
    x: gameWidth / 2,
    y: gameHeight - 30 * scaleFactor,
  });
  Body.setPosition(leftWall, { x: 15 * scaleFactor, y: gameHeight / 2 });
  Body.setPosition(rightWall, {
    x: gameWidth - 15 * scaleFactor,
    y: gameHeight / 2,
  });
  Body.setPosition(topLine, { x: gameWidth / 2, y: 150 * scaleFactor });

  // Scale fruits
  scaleFruitSizes(scaleFactor);
}

// Adjust the game for mobile when the window is resized
window.addEventListener('resize', adjustGameForMobile);

// Adjust the game for mobile on initial load
adjustGameForMobile();

//place the fruit where the user clicks on the screen
window.onpointerdown = (event) => {
  if (disableAction || !currentBody) return;

  // Calculate the position relative to the canvas
  const canvasBounds = render.canvas.getBoundingClientRect();
  const canvasX = event.clientX - canvasBounds.left;

  // Ensure the fruit is within the game boundaries
  if (canvasX < 30 || canvasX > 590) return;

  //here we can see disableaction while fruits falls, so you cant put another one until it stops
  disableAction = true;
  Body.setPosition(currentBody, { x: canvasX, y: currentBody.position.y });
  Sleeping.set(currentBody, false);

  setTimeout(() => {
    addCurrentFruit();
    disableAction = false;
  }, 1000);
};

//reset the game after game over
function resetGame() {
  // Reset the score
  score = 0;
  updateScore(0);

  // Remove all fruits from the world
  World.clear(world, true); // true to keep walls

  // Add the walls back and the first fruit
  World.add(world, [ground, leftWall, rightWall, topLine]);
  addCurrentFruit();
}

// Listen for collision events in the game's physics engine
Events.on(engine, 'collisionStart', (event) => {
  // Iterate through all pairs of colliding bodies
  event.pairs.forEach((collision) => {
    // Check if the colliding bodies have the same label (i.e., they are the same type of fruit)
    if (collision.bodyA.label === collision.bodyB.label) {
      // Remove both colliding fruits from the game world
      World.remove(world, [collision.bodyA, collision.bodyB]);

      // Find the index of the colliding fruit type in the FRUITS array
      const index = FRUITS.findIndex(
        (fruit) => fruit.label === collision.bodyA.label
      );

      // If the colliding fruit is the last one in the array, do nothing further
      if (index === FRUITS.length - 1) return;

      // Update the game score based on the fruit's score value
      const fruitScore = FRUITS[index].score;
      updateScore(fruitScore);

      // Determine the next fruit type to create by using the next index in the FRUITS array
      const newFruit = FRUITS[index + 1];
      const scaledRadius = newFruit.scaledRadius; // The scaled radius is used for proper size

      // Create a new fruit body of the next type at the collision position
      const body = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        scaledRadius,
        {
          render: {
            fillStyle: newFruit.color,
          },
          label: newFruit.label,
        }
      );

      // Add the new fruit body to the game world
      World.add(world, body);
    }

    // Check if the collision involves the top line, signaling game over
    if (
      (collision.bodyA.label === 'topLine' ||
        collision.bodyB.label === 'topLine') &&
      !disableAction
    ) {
      // Update high score if the current score is greater
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        updateHighScoreDisplay();
      }

      // Show a game over message and the player's score
      alert(`Game Over! You managed to get ${score} points!`);

      // Reset the game to its initial state
      resetGame();
    }
  });
});

// Add numbers to the fruits after they are rendered (matter.js dont have text property so we need to add it manually)
Events.on(render, 'afterRender', function () {
  const ctx = render.context;
  world.bodies.forEach(function (body) {
    // Check if the body is a fruit by finding it in the FRUITS array
    const fruit = FRUITS.find((fruit) => fruit.label === body.label);
    if (fruit) {
      const position = body.position;
      ctx.save();
      ctx.translate(position.x, position.y);
      ctx.rotate(body.angle);
      ctx.fillStyle = 'white'; // Text color
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fruit.radius / 2}px Arial`; // Adjust font size based on fruit radius
      ctx.fillText(fruit.text, 0, 0);
      ctx.restore();
    }
  });
});

//add first fruit to the game
addCurrentFruit();
