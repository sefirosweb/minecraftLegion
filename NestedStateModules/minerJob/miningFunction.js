const {
  StateTransition,
  BehaviorIdle,
  NestedStateMachine,
} = require("mineflayer-statemachine");

const BehaviorLoadConfig = require("@BehaviorModules/BehaviorLoadConfig");
const BehaviorMinerCheckLayer = require("@BehaviorModules/BehaviorMinerCheckLayer");
const BehaviorMinerCurrentLayer = require("@BehaviorModules/BehaviorMinerCurrentLayer");
const BehaviorMinerCurrentBlock = require("@BehaviorModules/BehaviorMinerCurrentBlock");
const BehaviorDigBlock = require("@BehaviorModules/BehaviorDigBlock");
const BehaviorMinerChecks = require("@BehaviorModules/BehaviorMinerChecks");
const BehaviorEatFood = require("@BehaviorModules/BehaviorEatFood");
const BehaviorMoveTo = require("@BehaviorModules/BehaviorMoveTo");
const BehaviorDigAndPlaceBlock = require("@BehaviorModules/BehaviorDigAndPlaceBlock");

const mineflayerPathfinder = require("mineflayer-pathfinder");
const { setMinerCords } = require("@modules/botConfig");

const movingWhile = (bot, nextCurrentLayer, movements) => {
  let x, y, z;

  if (bot.entity.position.x < nextCurrentLayer.xStart) {
    x = nextCurrentLayer.xStart;
  } else if (bot.entity.position.x > nextCurrentLayer.xEnd) {
    x = nextCurrentLayer.xEnd;
  } else {
    x = bot.entity.position.x;
  }

  if (bot.entity.position.y < nextCurrentLayer.yStart) {
    y = nextCurrentLayer.yStart;
  } else if (bot.entity.position.y > nextCurrentLayer.yEnd) {
    y = nextCurrentLayer.yEnd;
  } else {
    y = bot.entity.position.y;
  }

  if (bot.entity.position.z < nextCurrentLayer.zStart) {
    z = nextCurrentLayer.zStart;
  } else if (bot.entity.position.z > nextCurrentLayer.zEnd) {
    z = nextCurrentLayer.zEnd;
  } else {
    z = bot.entity.position.z;
  }

  const pathfinder = bot.pathfinder;
  const goal = new mineflayerPathfinder.goals.GoalBlock(x, y, z);
  pathfinder.setMovements(movements);
  pathfinder.setGoal(goal);
};

function miningFunction(bot, targets) {
  const mcData = require("minecraft-data")(bot.version);

  const start = new BehaviorIdle(targets);
  start.stateName = "Start";
  start.x = 125;
  start.y = 113;

  const finishedJob = new BehaviorIdle(targets);
  finishedJob.stateName = "Finished Job";
  finishedJob.x = 125;
  finishedJob.y = 113;

  const loadConfig = new BehaviorLoadConfig(bot, targets);
  loadConfig.stateName = "Load Bot Config";
  loadConfig.x = 325;
  loadConfig.y = 113;

  const exit = new BehaviorIdle(targets);
  exit.stateName = "Exit";
  exit.x = 125;
  exit.y = 313;

  const nextLayer = new BehaviorMinerCurrentLayer(bot, targets);
  nextLayer.stateName = "Next Layer";
  nextLayer.x = 525;
  nextLayer.y = 113;

  const currentBlock = new BehaviorMinerCurrentBlock(bot, targets);
  currentBlock.stateName = "Check next block";
  currentBlock.x = 725;
  currentBlock.y = 113;

  const digBlock = new BehaviorDigBlock(bot, targets);
  digBlock.stateName = "Dig Block";
  digBlock.x = 1025;
  digBlock.y = 563;

  const digAndPlaceBlock = new BehaviorDigAndPlaceBlock(bot, targets);
  digAndPlaceBlock.stateName = "Dig Block & Place";
  digAndPlaceBlock.x = 925;
  digAndPlaceBlock.y = 563;

  const moveToBlock = new BehaviorMoveTo(bot, targets);
  moveToBlock.stateName = "Move To Block";
  moveToBlock.movements = targets.movements
  moveToBlock.x = 925;
  moveToBlock.y = 313;

  const minerChecks = new BehaviorMinerChecks(bot, targets);
  minerChecks.stateName = "Miner Check";
  minerChecks.x = 325;
  minerChecks.y = 563;

  const checkLayer = new BehaviorMinerCheckLayer(bot, targets);
  checkLayer.stateName = "Check Layer Lava & Water";
  checkLayer.x = 525;
  checkLayer.y = 213;

  const eatFood = new BehaviorEatFood(bot, targets);
  eatFood.stateName = "Eat Food";
  eatFood.x = 725;
  eatFood.y = 363;

  const fillBlocks = require("@NestedStateModules/minerJob/fillFunction")(
    bot,
    targets
  );
  fillBlocks.x = 350;
  fillBlocks.y = 313;

  const findItemsAndPickup = require("@NestedStateModules/findItemsAndPickup")(
    bot,
    targets
  );
  findItemsAndPickup.stateName = "Find Items";
  findItemsAndPickup.x = 525;
  findItemsAndPickup.y = 363;

  const saveCurrentLayer = () => {
    const tunel = targets.config.minerCords.tunel
    const orientation = targets.config.minerCords.orientation
    const world = targets.config.minerCords.world
    const newMineCords = { ...targets.minerJob.original }


    if (tunel === 'horizontally') {
      if (orientation === 'z+') newMineCords.zStart++
      if (orientation === 'z-') newMineCords.zEnd--
      if (orientation === 'x+') newMineCords.zStart++
      if (orientation === 'x-') newMineCords.xEnd--
    }

    if (tunel === 'vertically') {
      newMineCords.yStart--
    }

    newMineCords.yStart = newMineCords.yStart.toString()
    newMineCords.yEnd = newMineCords.yEnd.toString()
    newMineCords.zStart = newMineCords.zStart.toString()
    newMineCords.zEnd = newMineCords.zEnd.toString()
    newMineCords.xStart = newMineCords.xStart.toString()
    newMineCords.xEnd = newMineCords.xEnd.toString()

    targets.minerJob.original = newMineCords


    newMineCords.tunel = tunel
    newMineCords.orientation = orientation
    newMineCords.world = world
    setMinerCords(bot.username, newMineCords)

    targets.config.minerCords = newMineCords
  }

  const transitions = [
    new StateTransition({
      parent: start,
      child: loadConfig,
      name: "start -> loadConfig",
      onTransition: () => {
        targets.minerJob.blockForPlace = [
          "netherrack",
          "basalt",
          "blackstone",
          "stone",
          "cobblestone",
          "cobbled_deepslate",
          "dirt",
          "tuff",
          "andesite",
          "diorite",
          "granite",
          "sandstone",
        ];
        targets.minerJob.nextLayer = nextLayer;

        const yStart =
          parseInt(targets.config.minerCords.yStart) >
            parseInt(targets.config.minerCords.yEnd)
            ? parseInt(targets.config.minerCords.yEnd)
            : parseInt(targets.config.minerCords.yStart);
        const yEnd =
          parseInt(targets.config.minerCords.yStart) >
            parseInt(targets.config.minerCords.yEnd)
            ? parseInt(targets.config.minerCords.yStart)
            : parseInt(targets.config.minerCords.yEnd);

        const xStart =
          parseInt(targets.config.minerCords.xStart) >
            parseInt(targets.config.minerCords.xEnd)
            ? parseInt(targets.config.minerCords.xEnd)
            : parseInt(targets.config.minerCords.xStart);
        const xEnd =
          parseInt(targets.config.minerCords.xStart) >
            parseInt(targets.config.minerCords.xEnd)
            ? parseInt(targets.config.minerCords.xStart)
            : parseInt(targets.config.minerCords.xEnd);

        const zStart =
          parseInt(targets.config.minerCords.zStart) >
            parseInt(targets.config.minerCords.zEnd)
            ? parseInt(targets.config.minerCords.zEnd)
            : parseInt(targets.config.minerCords.zStart);
        const zEnd =
          parseInt(targets.config.minerCords.zStart) >
            parseInt(targets.config.minerCords.zEnd)
            ? parseInt(targets.config.minerCords.zStart)
            : parseInt(targets.config.minerCords.zEnd);

        targets.minerJob.original = {
          xStart,
          xEnd,
          yStart,
          yEnd,
          zStart,
          zEnd,
        };
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: loadConfig,
      child: nextLayer,
      name: "loadConfig -> nextLayer",
      onTransition: () => {
        targets.entity = undefined;
        nextLayer.setMinerCords(loadConfig.getMinerCords());
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: nextLayer,
      child: finishedJob,
      name: "Mining finished",
      shouldTransition: () => nextLayer.isFinished(),
    }),

    new StateTransition({
      parent: nextLayer,
      child: checkLayer,
      name: "nextLayer -> checkLayer",
      onTransition: () => {
        const nextCurrentLayer = nextLayer.getCurrentLayerCoords();
        movingWhile(bot, nextCurrentLayer, targets.movements);
        checkLayer.setMinerCords(nextCurrentLayer);
      },
      shouldTransition: () => true,
    }),

    new StateTransition({
      parent: checkLayer,
      child: findItemsAndPickup,
      onTransition: () =>
        currentBlock.setMinerCords(nextLayer.getCurrentLayerCoords()),
      shouldTransition: () =>
        checkLayer.isFinished() ||
        !bot.inventory
          .items()
          .find((item) => targets.minerJob.blockForPlace.includes(item.name)),
    }),

    new StateTransition({
      parent: findItemsAndPickup,
      child: eatFood,
      shouldTransition: () => findItemsAndPickup.isFinished(),
    }),

    new StateTransition({
      parent: checkLayer,
      child: fillBlocks,
      name: "checkLayer -> fillBlocks",
      shouldTransition: () => {
        const item = bot.inventory
          .items()
          .find((item) => targets.minerJob.blockForPlace.includes(item.name));
        if (checkLayer.getFoundLavaOrWater() && item) {
          targets.item = item;
          return true;
        }
        return false;
      },
    }),

    new StateTransition({
      parent: fillBlocks,
      child: checkLayer,
      name: "Finished fill block",
      shouldTransition: () => fillBlocks.isFinished(),
    }),

    new StateTransition({
      parent: currentBlock,
      child: moveToBlock,
      name: "currentBlock -> moveToBlock",
      onTransition: () => {
        targets.minerJob.mineBlock = targets.position.clone();
        if (nextLayer.minerCords.tunel === "horizontally") {
          // Move to base of block
          targets.position.y = parseInt(checkLayer.minerCords.yStart);
          targets.position.dimension = targets.config.minerCords.world
        }
      },
      shouldTransition: () => currentBlock.isFinished(),
    }),

    new StateTransition({
      parent: currentBlock,
      child: nextLayer,
      name: "Finished chunk",
      onTransition: () => saveCurrentLayer(),
      shouldTransition: () => currentBlock.getLayerIsFinished(),
    }),

    new StateTransition({
      parent: moveToBlock,
      child: digAndPlaceBlock,
      onTransition: () => {
        targets.position = targets.minerJob.mineBlock;
      },
      shouldTransition: () =>
        (moveToBlock.isFinished() || moveToBlock.distanceToTarget() < 3) &&
        !bot.pathfinder.isMining(),
    }),

    new StateTransition({
      parent: digAndPlaceBlock,
      child: minerChecks,
      shouldTransition: () => digAndPlaceBlock.isFinished() && !digAndPlaceBlock.isOutOfBlocks(),
    }),

    new StateTransition({
      parent: digAndPlaceBlock,
      child: exit,
      shouldTransition: () => digAndPlaceBlock.isFinished() && digAndPlaceBlock.isOutOfBlocks(),
    }),

    new StateTransition({
      parent: minerChecks,
      child: eatFood,
      shouldTransition: () =>
        minerChecks.isFinished() && minerChecks.getIsReady(),
    }),

    new StateTransition({
      parent: eatFood,
      child: currentBlock,
      shouldTransition: () => eatFood.isFinished(),
    }),

    new StateTransition({
      parent: minerChecks,
      child: exit,
      name: "No pickaxes or shovel in inventory",
      shouldTransition: () =>
        minerChecks.isFinished() && !minerChecks.getIsReady(),
    }),
  ];

  const miningFunction = new NestedStateMachine(transitions, start, exit);
  miningFunction.stateName = "Mining";
  return miningFunction;
}

module.exports = miningFunction;
