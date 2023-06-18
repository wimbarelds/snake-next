let botIndex = 0;
let wallTiles = [];
let snakeTiles = [[]];
let candyTiles = [];
let floorTiles = [];

let SEARCH_SPEED = 18.5;

let depth,
  locationsSearched,
  lastCandyFound = Date.now();

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 640;

const OPPOSITES = {
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
  UP: 'DOWN',
  DOWN: 'UP',
};

const DIRECTIONS = {
  UP: { x: 0, y: -10 },
  DOWN: { x: 0, y: 10 },
  LEFT: { x: -10, y: 0 },
  RIGHT: { x: 10, y: 0 },
};

const directionsArray = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

// NOTE TO SELF: If you cant find a candy, go in the direction that has the most search-options

const DIRECTIONKEYS = Object.keys(DIRECTIONS);

const computeFloorTiles = () => {
  const floorTiles = [];
  // First copy our snake tiles as floor tiles as the snake must always start on valid floortiles
  snakeTiles.forEach((snake) => {
    snake.forEach((snakeTile) => floorTiles.push({ x: snakeTile.x, y: snakeTile.y }));
  });
  // Then expand outwards from there in all directions until a wall is hit
  // Create a map in which we record which tiles have been scanned, so we don't scan anything twice
  const scannedMap = snakeTiles.reduce((acc, snake) => {
    snake.forEach((curr) => {
      acc[`${curr.x}.${curr.y}`] = true;
    });
    return acc;
  }, {});

  // Create a list of tiles to search from
  let searchFromTiles = floorTiles.slice();
  while (true) {
    const newTiles = [];
    for (const floorTile of searchFromTiles) {
      const search = [
        { x: floorTile.x - 10, y: floorTile.y },
        { x: floorTile.x + 10, y: floorTile.y },
        { x: floorTile.x, y: floorTile.y - 10 },
        { x: floorTile.x, y: floorTile.y + 10 },
      ];
      for (const tile of search) {
        const key = `${tile.x}.${tile.y}`;
        if (scannedMap[key]) continue; // If we've already scanned this tile, ignore it
        scannedMap[key] = true; // Otherwise we're scanning it now, so adding it to the list
        if (isWallCollisionAt(tile)) continue; // If there is a wall here, it's not a floor tile
        if (isOutOfBounds(tile)) continue;
        newTiles.push(tile);
      }
    }
    // If we haven't found any new tiles, we're done
    if (newTiles.length === 0) break;
    // Add all the newly found tiles to the floorTiles list
    floorTiles.push.apply(floorTiles, newTiles);
    // Then search from the new
    searchFromTiles = newTiles;
  }
  return floorTiles;
};

let placeFakeCandy;

const init = function (data) {
  botIndex = data.botIndex;
  candyTiles = data.candyTiles;
  snakeTiles = data.level.snakeTiles;
  // Sort walltiles for faster searching
  wallTiles = data.level.wallTiles.slice().sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  floorTiles = computeFloorTiles();
  placeFakeCandy = () => {
    const numCandyToPlace = Math.round(floorTiles.length / 150);
    for (let i = 0; i < numCandyToPlace; i++) {
      const randNum = Math.floor(Math.random() * floorTiles.length);
      const pos = floorTiles[randNum];
      if (snakeTiles.some((snake) => snake.some((snakeTile) => snakeTile.x === pos.x && snakeTile.y === pos.y)))
        continue;
      if (candyTiles.some((candyTile) => candyTile.x === pos.x && candyTile.y === pos.y)) continue;
      placeCandy(pos);
    }
  };
};

function placeCandy(data) {
  if (data instanceof Array) {
    candyTiles.push(...data);
  } else {
    candyTiles.push(data);
  }
}

const candyCheck = (location) => {
  return candyTiles.findIndex((candyTile) => location.x === candyTile.x && location.y === candyTile.y);
};

const isWallCollisionAt = (pos) => {
  // Determine an initial search point based on the x point of the position
  const xMin = wallTiles[0].x;
  const xMax = wallTiles[wallTiles.length - 1].x;
  const xDelta = xMax - xMin;
  const pct = Math.min(1, Math.max(0, (pos.x - xMin) / xDelta));
  const searchStart = Math.floor(pct * (wallTiles.length - 1));
  // Make sure our search start point isn't the position we're looking for
  const searchStartTile = wallTiles[searchStart];
  if (searchStartTile.x === pos.x && searchStartTile.y === pos.y) return true;
  // Determine which direction we should be looking in
  const direction = pos.x > searchStartTile.x || (pos.x === searchStartTile.x && pos.y > searchStartTile.y) ? 1 : -1;
  for (let i = searchStart + direction; i < wallTiles.length && i >= 0; i += direction) {
    const tile = wallTiles[i];
    if (tile.x === pos.x && tile.y === pos.y) return true;
    if (direction === 1 && tile.x > pos.x) return false;
    if (direction === -1 && tile.x < pos.x) return false;
  }
  return false;
};

const isOutOfBounds = (pos) => {
  if (pos.x < 0) return true;
  if (pos.y < 0) return true;
  if (pos.x >= CANVAS_WIDTH) return true;
  if (pos.y >= CANVAS_HEIGHT) return true;
  return false;
};

const isTailCollision = (location, skipHead = false) => {
  return snakeTiles.some((snake) =>
    snake.some((snakeTile) => {
      if (skipHead && location === snakeTile) return false;
      if (location.x !== snakeTile.x) return false;
      if (location.y !== snakeTile.y) return false;
      return true;
    }),
  );
};

const deathCheck = (location) => {
  if (isTailCollision(location)) return true;
  if (isOutOfBounds(location)) return true;
  if (isWallCollisionAt(location)) return true;
  return false;
};

const getLocationStr = (location) => {
  return `x${location.x},y${location.y}`;
};

const trimCollisionLocations = (locations) => {
  return locations.filter((location) => !deathCheck(location));
};

const trimForbidden = (locations, forbidden) => {
  let newLocations = [];
  for (let location of locations) {
    let locationStr = getLocationStr(location);
    if (!forbidden[locationStr]) {
      newLocations.push(location);
    }
  }
  return newLocations;
};

const getExpandedSearchArea = (search, forbidden) => {
  const newSearch = {};
  for (let direction in search) {
    newSearch[direction] = [];

    const locations = search[direction];
    for (let location of locations) {
      let additions = [
        { x: location.x + 10, y: location.y },
        { x: location.x, y: location.y + 10 },
        { x: location.x, y: location.y - 10 },
        { x: location.x - 10, y: location.y },
      ];
      additions = trimForbidden(additions, forbidden);
      additions = trimCollisionLocations(additions);

      for (let addition of additions) {
        // Add these locations for searching
        newSearch[direction].push(addition);
        // Prevent this location from being evaluated again
        forbidden[getLocationStr(addition)] = addition;
      }
    }
  }
  return newSearch;
};

const searchCandy = (direction, maxLocationsSearched) => {
  const snakeHead = snakeTiles[botIndex][snakeTiles[botIndex].length - 1];
  // Array of where we cant go
  const forbidden = { [getLocationStr(snakeHead)]: snakeHead };

  // Array containing our next search points
  let search = {};
  const exploredInDirection = {};
  const opposite = OPPOSITES[direction];
  // Determine possible search tiles
  for (let directionKey of DIRECTIONKEYS) {
    // We cannot go immediately in the opposite direction of where we're going
    if (directionKey === opposite) continue;
    const DIRECTION = DIRECTIONS[directionKey];
    search[directionKey] = trimCollisionLocations([{ x: snakeHead.x + DIRECTION.x, y: snakeHead.y + DIRECTION.y }]);
    exploredInDirection[directionKey] = search[directionKey].length;
  }

  locationsSearched = 0;
  for (let depth = 0; ; depth++) {
    for (let direction in search) {
      let locations = search[direction];
      // Check for candyTiles on all search locations, if found that's the direction we go
      for (let location of locations) {
        // If we find a candy, go there
        if (candyCheck(location) >= 0) {
          lastCandyFound = Date.now();
          return direction;
        }
        // If we don't find a candy but have searched too far, stop searching
        if (++locationsSearched >= maxLocationsSearched) {
          // Instead of going in the direction of a candy, go into the direction of the most open space
          let mostOpenDirection = false;
          let mostOpenDirectionSpace = 0;
          for (let directionKey in exploredInDirection) {
            if (exploredInDirection[directionKey] > mostOpenDirectionSpace) {
              mostOpenDirection = directionKey;
              mostOpenDirectionSpace = exploredInDirection[directionKey];
            }
          }
          return mostOpenDirection;
        }
      }
    }
    // Find new places to search
    search = getExpandedSearchArea(search, forbidden);
    const numSearchLocations = Object.values(search).reduce((count, locations) => count + locations.length, 0);
    if (numSearchLocations === 0) {
      // There's nowhere to go, we've exhausted all search options
      return 0;
    } else {
      for (let directionKey in exploredInDirection) {
        exploredInDirection[directionKey] += search[directionKey].length;
      }
    }
  }
};

const snapDecision = (direction) => {
  let snakeHead = snakeTiles[botIndex][snakeTiles[botIndex].length - 1];
  let directionIndex = DIRECTIONKEYS.indexOf(direction);
  for (let i = 0; i < DIRECTIONKEYS.length; i++) {
    let moveIndex = (directionIndex + i) % DIRECTIONKEYS.length;
    let moveDirection = DIRECTIONKEYS[moveIndex];
    let move = DIRECTIONS[moveDirection];
    if (!deathCheck({ x: snakeHead.x + move.x, y: snakeHead.y + move.y })) return moveDirection;
  }
  return false;
};

let stuckDirection = null;
const compactMovement = (direction) => {
  if (stuckDirection === null) stuckDirection = direction;
  const snakeHead = snakeTiles[botIndex][snakeTiles[botIndex].length - 1];

  if (stuckDirection === 'UP' || stuckDirection === 'DOWN') {
    // Try move as much vertically as possible
    if (direction === stuckDirection) {
      const forwards = DIRECTIONS[direction];
      //  If we can continue going forwards, do that
      if (!deathCheck({ x: snakeHead.x + forwards.x, y: snakeHead.y + forwards.y })) return direction;

      // We can't continue to go in the direction we want to, reverse
      stuckDirection = OPPOSITES[direction];

      const left = DIRECTIONS.LEFT;
      if (!deathCheck({ x: snakeHead.x + left.x, y: snakeHead.y + left.y })) return 'LEFT';
      return 'RIGHT';
    } else {
      const desiredDirection = DIRECTIONS[stuckDirection];
      if (!deathCheck({ x: snakeHead.x + desiredDirection.x, y: snakeHead.y + desiredDirection.y }))
        return stuckDirection;
      const forwards = DIRECTIONS[direction];
      if (!deathCheck({ x: snakeHead.x + forwards.x, y: snakeHead.y + forwards.y })) return direction;
      return OPPOSITES[stuckDirection];
    }
  } else {
    // Try move as much horizontally as possible
    if (direction === stuckDirection) {
      const forwards = DIRECTIONS[direction];
      //  If we can continue going forwards, do that
      if (!deathCheck({ x: snakeHead.x + forwards.x, y: snakeHead.y + forwards.y })) return direction;

      // We can't continue to go in the direction we want to, reverse
      stuckDirection = OPPOSITES[direction];

      const up = DIRECTIONS.UP;
      if (!deathCheck({ x: snakeHead.x + up.x, y: snakeHead.y + up.y })) return 'UP';
      return 'DOWN';
    } else {
      const desiredDirection = DIRECTIONS[stuckDirection];
      if (!deathCheck({ x: snakeHead.x + desiredDirection.x, y: snakeHead.y + desiredDirection.y }))
        return stuckDirection;
      const forwards = DIRECTIONS[direction];
      if (!deathCheck({ x: snakeHead.x + forwards.x, y: snakeHead.y + forwards.y })) return direction;
      return OPPOSITES[stuckDirection];
    }
  }
};

function moveSnake(data) {
  // Move snakeTiles
  const snake = snakeTiles[data.snakeIndex];
  let tailEnd = snake[0];
  let move = DIRECTIONS[data.direction];
  for (let i = 0; i < snake.length; i++) {
    // Tail
    if (i < snake.length - 1) {
      snake[i] = snake[i + 1];
    }
    // Head
    else {
      snake[i] = { x: snake[i].x + move.x, y: snake[i].y + move.y };
    }
  }

  // Remove candyTiles once picked up and extend tail
  let candyIndex = candyCheck(tailEnd);
  if (candyIndex >= 0) {
    candyTiles.splice(candyIndex, 1);
    snake.unshift(tailEnd);
  }
}

function tick(data) {
  let before = Date.now();
  let maxSearchLocations = Math.round(data.interval * SEARCH_SPEED);
  let newDirection = searchCandy(data.direction, maxSearchLocations);

  // If we found out we're stuck, move compactly (ie: zigzag)
  if (newDirection === 0) newDirection = compactMovement(data.direction);
  else {
    // If we're not stuck, save that
    stuckDirection = null;
    // If we still can't find a candyTiles, make a snap decision
    if (newDirection == false) newDirection = snapDecision(data.direction);
  }

  if (newDirection) postMessage(newDirection);

  let frameTime = Date.now() - before;
  let maxTime = data.frameDelay;

  if (frameTime > maxTime) console.warn({ frameTime, maxTime: data.frameDelay, locationsSearched, depth });
  // If nothing has been found for too long, add artificial candies to lead snake to other candyTiles
  if (lastCandyFound < Date.now() - 10000) {
    console.log('No candyTiles found for too long, placing artificial candyTiles');
    placeFakeCandy();
    lastCandyFound = Date.now();
  }
}

onmessage = function (message) {
  let obj = message.data;
  switch (obj.type) {
    case 'init':
      init(obj.data);
      console.log(`Webworker AI wim-bot.js ${obj.data.botIndex} ready`);
      break;
    case 'candy':
      placeCandy(obj.data);
      break;
    case 'move':
      moveSnake(obj.data);
    case 'tick':
      tick(obj.data);
      break;
  }
};
