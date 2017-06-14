var NONE        = 4,
    UP          = 3,
    LEFT        = 2,
    DOWN        = 1,
    RIGHT       = 11,
    WAITING     = 5,
    PAUSE       = 6,
    PLAYING     = 7,
    COUNTDOWN   = 8,
    EATEN_PAUSE = 9,
    DYING       = 10,
    Pacman      = {};

var MANUAL      = 1,
    AUTO        = 2;

  

Pacman.FPS = 30;
Pacman.Ghost = function (game, map, score, colour) {

        var     eatable   = null,
                eaten     = null,
                eatPac    = null,
                score     = score,
                mode      = game.mode,
                controller= new Pacman.Control(map,{"mode":mode});
        

        function eatInc(){
            eatPac = eatPac + 1;
        };

        function newLevel() {
            reset();
            eaten = null;
        };

        function isVunerable() { 
            return eatable !== null;
        };

        function isDangerous() {
            return eaten === null;
        };

        function isHidden() { 
            return eatable === null && eaten !== null;
        };
        
        function reset() {
            eaten = null;
            eatable = null;
            eatPac = null;
            controller.init();
        };

        // events activated when pills are eaten. 
        function makeEatable() {
            if(mode === AUTO)
                controller.oppositeDirection();
            eatable = game.getTick();
            controller.setEatable(eatable);
        };

        function eat() { 
            eatable = null;
            eaten = game.getTick();
            controller.setEaten(eaten);
            controller.setEatable(eatable);
            
        };

        function secondsAgo(tick) { 
            return (game.getTick() - tick) / Pacman.FPS;
        };

        function getColour() { 
            if (eatable) { 
                if (secondsAgo(eatable) > 5) { 
                    return game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";//shine 
                } else { 
                    return "#0000BB"; // chaange color if vulnerable
                }
            } else if(eaten) { 
                return "#222";
            } 

            if(mode === MANUAL)
                return "#FFFF00";
            if(mode === AUTO)
                return colour;
        };

        function drawDead(ctx, amount) { 

            var stats = controller.getStat();
            var direction = stats.direction,
                due       = stats.due,
                pos       = stats.position;

            var s    = map.blockSize, 
                top  = (pos.y/10) * s,
                left = (pos.x/10) * s;

            if (amount >= 1) { 
                return;
            }

            ctx.fillStyle = getColour();
            ctx.beginPath();

            ctx.moveTo(left, base);

            ctx.quadraticCurveTo(left, top, left + (s/2),  top);
            ctx.quadraticCurveTo(left + s, top, left+s,  base);
            
            // Wavy things at the bottom
            ctx.quadraticCurveTo(tl-(inc*1), base+high, tl - (inc * 2),  base);
            ctx.quadraticCurveTo(tl-(inc*3), base+low, tl - (inc * 4),  base);
            ctx.quadraticCurveTo(tl-(inc*5), base+high, tl - (inc * 6),  base);
            ctx.quadraticCurveTo(tl-(inc*7), base+low, tl - (inc * 8),  base); 
            ctx.quadraticCurveTo(tl-(inc*9), base+high, tl - (inc * 10), base); 

            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "#FFF";
            ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
            ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
            ctx.closePath();
            ctx.fill();
        };

        function draw(ctx) {
            var stats = controller.getStat();
            var direction = stats.direction,
                due       = stats.due,
                pos       = stats.position;
            var s    = map.blockSize, 
                top  = (pos.y/10) * s,
                left = (pos.x/10) * s;


            if (eatable && secondsAgo(eatable) > 8) {
                eatable = null;
                controller.setEatable(null);
            }
            
            if (eaten && secondsAgo(eaten) > 3) { 
                eaten = null;
                controller.setEaten(null);
            }
            
            var tl = left + s;
            var base = top + s - 3;
            var inc = s / 10;

            var high = game.getTick() % 10 > 5 ? 3  : -3;
            var low  = game.getTick() % 10 > 5 ? -3 : 3;

            ctx.fillStyle = getColour();

            ctx.beginPath();

            ctx.moveTo(left, base);

            ctx.quadraticCurveTo(left, top, left + (s/2),  top);
            ctx.quadraticCurveTo(left + s, top, left+s,  base);
            
            // Wavy things at the bottom
            ctx.quadraticCurveTo(tl-(inc*1), base+high, tl - (inc * 2),  base);
            ctx.quadraticCurveTo(tl-(inc*3), base+low, tl - (inc * 4),  base);
            ctx.quadraticCurveTo(tl-(inc*5), base+high, tl - (inc * 6),  base);
            ctx.quadraticCurveTo(tl-(inc*7), base+low, tl - (inc * 8),  base); 
            ctx.quadraticCurveTo(tl-(inc*9), base+high, tl - (inc * 10), base); 

            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = "#FFF";
            ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
            ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
            ctx.closePath();
            ctx.fill();

            var f = s / 12;
            var off = {};
            off[RIGHT] = [f, 0];
            off[LEFT]  = [-f, 0];
            off[UP]    = [0, -f];
            off[DOWN]  = [0, f];

            ctx.beginPath();
            ctx.fillStyle = "#000";
            if(direction === NONE) 
                direction=RIGHT;
            ctx.arc(left+6+off[direction][0], top+6+off[direction][1], 
                    s / 15, 0, 300, false);
            ctx.arc((left+s)-6+off[direction][0], top+6+off[direction][1], 
                    s / 15, 0, 300, false);
            ctx.closePath();
            ctx.fill();

        };

        function move() {
            var pos=controller.Mode();
            if (eatPac === 4) {
                    game.completedLevel();
                }
            return {
                "new" : pos.new,
                "old" : pos.old
            };
        };

        function keyDown(e){
            return controller.keyDown(e);
        };
        

        return {
            "newLevel"    : newLevel,
            "eat"         : eat,
            "eatInc"      : eatInc,
            "isVunerable" : isVunerable,
            "isDangerous" : isDangerous,
            "makeEatable" : makeEatable,
            "drawDead"    : drawDead,
            "keyDown"     : keyDown,
            "reset"       : reset,
            "move"        : move,
            "draw"        : draw
        };
};

Pacman.User = function (game, map, score, colour) {
    var eaten     = null,
        eliminate = 0,
        userScore = score,
        mode      = game.mode,
        tmp_pos   = null,
        controller= new Pacman.Control(map,{"mode":mode});

    function setEaten(){
        eaten=0;
    }

    function getEat(){
        return eaten;
    }

    function setAlive(){
        eliminate = 0;
    }

    function newLevel() {
        reset();
        eaten = 0;
        //eliminate = null;
    };

    function reset() {
        controller.init();
    };        

    function keyDown(e){
        return controller.keyDown(e);
    };

    function setDead(){
        eliminate = 1;
    };

    function checkDead(){
        return eliminate;
    };

    function move(ctx) {

        var nextWhole   = null, 
            block       = null;
        
        var ret_pos;
        if(eliminate === 0){
            // var ret_pos = controller.Mode();
            ret_pos = controller.Mode();
        }
        else{
            ret_pos={
                "new" : controller.getStat().position,
                "old" : controller.getStat().position
            };
        }
        

        
        var stats = controller.getStat();
        var dir=stats.direction,
            pos=stats.position;

        nextWhole = controller.next(pos, dir);
        block = map.block(nextWhole);        
        
        if(mode === AUTO){
            if ((isMidSquare(pos.y) || isMidSquare(pos.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {
                map.setBlock(nextWhole, Pacman.EMPTY);
                eaten += 1;

                if (block === Pacman.PILL) { 
                    game.eatenPill();
                }
            }
        }
        if(mode === MANUAL){
            if ((isMidSquare(pos.y) || isMidSquare(pos.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {
                
                map.setBlock(nextWhole, Pacman.EMPTY);           
                userScore.addScore((block === Pacman.BISCUIT) ? 10 : 50);
                eaten += 1;
                
                if (eaten === 182) {
                    game.completedLevel();
                }
                
                if (block === Pacman.PILL) { 
                    game.eatenPill();
                }
            }
        //describe eat action
        }   
                
        return {
            "new" : ret_pos.new,
            "old" : ret_pos.old
        };
    };


    //*moved to new object
    function isMidSquare(x) { 
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    function calcAngle(dir, pos) { 
        if (dir == RIGHT && (pos.x % 10 < 5)) {
            return {"start":0.25, "end":1.75, "direction": false};
        } else if (dir === DOWN && (pos.y % 10 < 5)) { 
            return {"start":0.75, "end":2.25, "direction": false};
        } else if (dir === UP && (pos.y % 10 < 5)) { 
            return {"start":1.25, "end":1.75, "direction": true};
        } else if (dir === LEFT && (pos.x % 10 < 5)) {             
            return {"start":0.75, "end":1.25, "direction": true};
        }
        return {"start":0, "end":2, "direction": false};
    };

    function drawDead(ctx, amount) { 

        var pos = controller.getStat().position;

        var size = map.blockSize, 
            half = size / 2;

        if (amount >= 1) { 
            return;
        }
        //  
        ctx.fillStyle = (mode === AUTO)? colour : "#FFFF00";
            
        ctx.beginPath();        
        ctx.moveTo(((pos.x/10) * size) + half, 
                   ((pos.y/10) * size) + half);
        
        ctx.arc(((pos.x/10) * size) + half, 
                ((pos.y/10) * size) + half,
                half, 0, Math.PI * 2 * amount, true); 
        
        ctx.fill();
    };

    function draw(ctx) { 
        if(eliminate !== 1){

            var pos = controller.getStat().position;
            var dir = controller.getStat().direction;

            var s     = map.blockSize, 
                angle = calcAngle(dir, pos);

            ctx.fillStyle = ( mode === AUTO )? colour : "#FFFF00";

            ctx.beginPath();
            ctx.moveTo(((pos.x/10) * s) + s / 2,
                       ((pos.y/10) * s) + s / 2);
            
            ctx.arc(((pos.x/10) * s) + s / 2,
                    ((pos.y/10) * s) + s / 2,
                    s / 2, Math.PI * angle.start, 
                    Math.PI * angle.end, angle.direction); 
            
            ctx.fill();    
        }
    };

    
    newLevel();

    return {
        "checkDead"     : checkDead,
        "newLevel"      : newLevel,
        "drawDead"      : drawDead,
        "setEaten"        : setEaten,
        "setDead"       : setDead,
        "keyDown"       : keyDown,
        "setAlive"      : setAlive,
        "getEat"        : getEat,
        "reset"         : reset,
        "draw"          : draw,
        "move"          : move
    };
};

Pacman.Map = function (size) {
    
    var height    = null, 
        width     = null, 
        blockSize = size,
        pillSize  = 0,
        map       = null;
    
    function withinBounds(y, x) {
        return y >= 0 && y < height && x >= 0 && x < width;
    }
    
    function isWall(pos) {
        return withinBounds(pos.y, pos.x) && map[pos.y][pos.x] === Pacman.WALL;
    }
    
    function isFloorSpace(pos) {
        if (!withinBounds(pos.y, pos.x)) {
            return false;
        }
        var peice = map[pos.y][pos.x];
        return peice === Pacman.EMPTY || 
            peice === Pacman.BISCUIT ||
            peice === Pacman.PILL;
    }
    
    function drawWall(ctx) {

        var i, j, p, line;
        
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth   = 5;
        ctx.lineCap     = "round";
        
        for (i = 0; i < Pacman.WALLS.length; i += 1) {
            line = Pacman.WALLS[i];
            ctx.beginPath();

            for (j = 0; j < line.length; j += 1) {

                p = line[j];
                
                if (p.move) {
                    ctx.moveTo(p.move[0] * blockSize, p.move[1] * blockSize);
                } else if (p.line) {
                    ctx.lineTo(p.line[0] * blockSize, p.line[1] * blockSize);
                } else if (p.curve) {
                    ctx.quadraticCurveTo(p.curve[0] * blockSize, 
                                         p.curve[1] * blockSize,
                                         p.curve[2] * blockSize, 
                                         p.curve[3] * blockSize);   
                }
            }
            ctx.stroke();
        }
    }
    
    function reset() {       
        map    = Pacman.MAP.clone();
        height = map.length;
        width  = map[0].length;        
    };

    function block(pos) {
        return map[pos.y][pos.x];
    };
    
    function setBlock(pos, type) {
        map[pos.y][pos.x] = type;
    };

    function drawPills(ctx) { 

        if (++pillSize > 30) {
            pillSize = 0;
        }
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
                if (map[i][j] === Pacman.PILL) {
                    ctx.beginPath();

                    ctx.fillStyle = "#000";
		            ctx.fillRect((j * blockSize), (i * blockSize), 
                                 blockSize, blockSize);

                    ctx.fillStyle = "#FFF";
                    ctx.arc((j * blockSize) + blockSize / 2,
                            (i * blockSize) + blockSize / 2,
                            Math.abs(5 - (pillSize/3)), 
                            0, 
                            Math.PI * 2, false); 
                    ctx.fill();
                    ctx.closePath();
                }
		    }
	    }
    };
    
    function draw(ctx) {
        
        var i, j, size = blockSize;

        ctx.fillStyle = "#000";
	    ctx.fillRect(0, 0, width * size, height * size);

        drawWall(ctx);
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
			    drawBlock(i, j, ctx);
		    }
	    }
    };
    
    function drawBlock(y, x, ctx) {

        var layout = map[y][x];

        if (layout === Pacman.PILL) {
            return;
        }

        ctx.beginPath();
        
        if (layout === Pacman.EMPTY || layout === Pacman.BLOCK || 
            layout === Pacman.BISCUIT) {
            
            ctx.fillStyle = "#000";
		    ctx.fillRect((x * blockSize), (y * blockSize), 
                         blockSize, blockSize);

            if (layout === Pacman.BISCUIT) {
                ctx.fillStyle = "#FFF";
		        ctx.fillRect((x * blockSize) + (blockSize / 2.5), 
                             (y * blockSize) + (blockSize / 2.5), 
                             blockSize / 6, blockSize / 6);
	        }
        }
        ctx.closePath();	 
    };

    reset();
    
    return {
        "draw"         : draw,
        "drawBlock"    : drawBlock,
        "drawPills"    : drawPills,
        "block"        : block,
        "setBlock"     : setBlock,
        "reset"        : reset,
        "isWallSpace"  : isWall,
        "isFloorSpace" : isFloorSpace,
        "height"       : height,
        "width"        : width,
        "blockSize"    : blockSize
    };
};

Pacman.Audio = function(game) {
    
    var files          = [], 
        endEvents      = [],
        progressEvents = [],
        playing        = [];
    
    function load(name, path, cb) { 

        var f = files[name] = document.createElement("audio");

        progressEvents[name] = function(event) { progress(event, name, cb); };
        
        f.addEventListener("canplaythrough", progressEvents[name], true);
        f.setAttribute("preload", "true");
        f.setAttribute("autobuffer", "true");
        f.setAttribute("src", path);
        f.pause();        
    };

    function progress(event, name, callback) { 
        if (event.loaded === event.total && typeof callback === "function") {
            callback();
            files[name].removeEventListener("canplaythrough", 
                                            progressEvents[name], true);
        }
    };

    function disableSound() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
            files[playing[i]].currentTime = 0;
        }
        playing = [];
    };

    function ended(name) { 

        var i, tmp = [], found = false;

        files[name].removeEventListener("ended", endEvents[name], true);

        for (i = 0; i < playing.length; i++) {
            if (!found && playing[i]) { 
                found = true;
            } else { 
                tmp.push(playing[i]);
            }
        }
        playing = tmp;
    };

    function play(name) { 
        if (!game.soundDisabled()) {
            endEvents[name] = function() { ended(name); };
            playing.push(name);
            files[name].addEventListener("ended", endEvents[name], true);
            files[name].play();
        }
    };

    function pause() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
        }
    };
    
    function resume() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].play();
        }        
    };
    
    return {
        "disableSound" : disableSound,
        "load"         : load,
        "play"         : play,
        "pause"        : pause,
        "resume"       : resume
    };
};

Pacman.Control = function(map,status){
    var position  = null,
        direction = null,
        keyMap    = {},
        due;


    var eatable = status.eatable,
        eaten   = status.eaten,
        mode    = status.mode;
    
    // var eatable = null,
    //     eaten   = null,
    //     mode    = null;
    //set key value
    keyMap[KEY.ARROW_LEFT]  = LEFT;
    keyMap[KEY.ARROW_UP]    = UP;
    keyMap[KEY.ARROW_RIGHT] = RIGHT;
    keyMap[KEY.ARROW_DOWN]  = DOWN;


    function Mode(){
        var npos   = null,
            oldPos = position,
            onGrid = onGridSquare(position);

        if (due !== direction) {
            npos = getNewCoord(due, position);
            
            if(mode === MANUAL){
                if (isOnSamePlane(due, direction) || 
                (onGrid && map.isFloorSpace(next(npos, due))))
                    direction = due;
                else
                    npos = null;
            }

            //if controller setting is auto
            if(mode === AUTO){
                //check if it is on leagal path
                if (onGrid &&map.isFloorSpace(next(npos,due)))
                    direction = due; 
                else 
                    npos = null;
            }
        }
        if (npos === null) {
            npos = getNewCoord(direction, position);
        }
        if (onGrid && map.isWallSpace(next(npos,direction))) {
            
            //change heading position
            if(mode === AUTO){
                due = getRandomDirection();
                return Mode();
            }

            //do nothing when hit the wall
            if(mode === MANUAL){
                direction = NONE;
                return {"new" : position, "old" : position};
            }
        }

        var tmp = pane(position);

        if (tmp)    npos = tmp;
        position = npos; 
        
        if(mode === AUTO)
            due = getRandomDirection();

        return {
            "new" : position,
            "old" : oldPos
        };
    };


    function getNewCoord(dir, current) { 
        if(mode === AUTO){            
            var speed  = isVunerable() ? 1 : isHidden() ? 4 : 2,
            xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
            ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);
    
            return {
                "x": addBounded(current.x, xSpeed),
                "y": addBounded(current.y, ySpeed)
            };
        }
        if(mode === MANUAL){
            return {
            "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
            "y": current.y + (dir === DOWN && 2 || dir === UP    && -2 || 0)
        };
        }
    };

    ////////////auto part
    
    /* Collision detection(walls) is done when a ghost lands on an
     * exact block, make sure they dont skip over it 
     */
    function oppositeDirection() { 
        direction = direction === LEFT && RIGHT ||
                    direction === RIGHT && LEFT ||
                    direction === UP && DOWN || UP;
    };

    function addBounded(x1, x2) { 
        var rem    = x1 % 10, 
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if(rem > 0 && result < 0) { 
            return x1 - rem;
        }
        return x1 + x2;
    };

    function getRandomDirection(){
        var moves = (direction === LEFT || direction === RIGHT) 
            ? [UP, DOWN] : [LEFT, RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    };

    function isVunerable() { 
        return eatable !== null;
    };
    
    function isDangerous() {
        return eaten === null;
    };

    function isHidden() { 
        return eatable === null && eaten !== null;
    };
    ////////////auto part
    

    ////////////manual part
    function keyDown(e) {
        if (typeof keyMap[e.keyCode] !== "undefined") { 
            due = keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
    };

    function isMidSquare(x) { 
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    function isOnSamePlane(due, dir) { 
        return 
        ((due === LEFT || due === RIGHT) && (dir === LEFT || dir === RIGHT)) || 
        ((due === UP   || due === DOWN)  && (dir === UP   || dir === DOWN ));
    };

    ////////////manual part


    ////////////common elements

    function pointToCoord(x) {
        return Math.round(x / 10);
    };

    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function next(pos, dir) {
        return {
            "y" : pointToCoord(nextSquare(pos.y, dir)),
            "x" : pointToCoord(nextSquare(pos.x, dir)),
        };                               
    };

    function onWholeSquare(x) {
        return x % 10 === 0;
    };

    function pane(pos) {

        if (pos.y === 100 && pos.x >= 190 && direction === RIGHT) {
            return {"y": 100, "x": -10};
        }
        
        if (pos.y === 100 && pos.x <= -10 && direction === LEFT) {
            return position = {"y": 100, "x": 190};
        }

        return false;
    };
    ////////////common elements

    function setEaten(in_eaten){
        eaten   = in_eaten;
    };
    function setEatable(in_eatable){
        eatable = in_eatable;
    }
    function setDue(in_due){
        due = in_due;  
    };
    function setDir(in_dir){
        direction = in_dir;
    };
    function init(){
        if(mode ===AUTO){
            direction = getRandomDirection();
            due = getRandomDirection();
            position={"x":90,"y":80};
            eatable = null;
            eaten = null;
        }
        if(mode === MANUAL){
            direction = LEFT;
            due = LEFT;
            position = {"x": 90, "y": 120};
            eatable = null;
            eaten = null;
        }
        
    }

    function getStat(){
        if(mode === MANUAL){
            return{
                "direction" :direction,
                "position"  :position,
                "due"       :due
            };
        }
        if(mode === AUTO){
            return{
                "direction" :direction,
                "position"  :position,
                "eatable"   :eatable,
                "eaten"     :eaten,
                "due"       :due
            };
        }
    }

    return {
        "getRandomDirection" : getRandomDirection,
        "oppositeDirection"  : oppositeDirection,
        "isVunerable"        : isVunerable,
        "setEatable"         : setEatable,
        "setEaten"           : setEaten,
        "getStat"            : getStat,
        "keyDown"            : keyDown,
        "setDue"             : setDue,
        "setDir"             : setDir,
        "next"               : next,
        "Mode"               : Mode,
        "init"               : init
    };
};

Pacman.Score = function () {

    var current_score = 0,
        lives         = null;

    function addScore(nScore) { 
        current_score += nScore;
        if (current_score >= 10000 && current_score - nScore < 10000) { 
            lives += 1;
        }
    };

    function theScore() { 
        return current_score;
    };

    function loseLife() { 
        lives -= 1;
    };

    function getLives() {
        return lives;
    };

    function initUser() {
        current_score = 0;
        lives = 3;
    };

    return {
        "addScore" : addScore,
        "initUser" : initUser,
        "theScore" : theScore,
        "getLives" : getLives,
        "loseLife" : loseLife
    };
};

var PACMAN = (function () {

    var state        = WAITING,
        audio        = null,
        ghosts       = [], //enemy stack
        Specs   = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"], //color specs
        eatenCount   = 0,
        level        = 0,
        tick         = 0,
        enemyPos, userPos, 
        stateChanged = true,
        timerStart   = null,
        lastTime     = 0,
        ctx          = null,
        timer        = null,
        map          = null,
        user         = null,
        stored       = null,
        score        = null,
        gameType     = null;
    var completeFlag = 0;
    function getTick() { 
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font      = "12px BDCartoonShoutRegular";
        ctx.fillText(text, 
                     (position["new"]["x"] / 10) * map.blockSize, 
                     ((position["new"]["y"] + 5) / 10) * map.blockSize);
    }
    
    function dialog(text) {
        ctx.fillStyle = "#FFFF00";
        ctx.font      = "14px BDCartoonShoutRegular";
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2;        
        ctx.fillText(text, x, (map.height * 10) + 8);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };
    
    function startLevel() {        
        user.reset();
        for (var i = 0; i < ghosts.length; i += 1) { 
            ghosts[i].reset();
            if(completeFlag==1){
                ghosts[i].setAlive();
            }
        }
        audio.play("start");
        timerStart = tick;
        setState(COUNTDOWN);
        completeFlag=0;
    }    

    function startNewGame() {
        setState(WAITING);
        level = 1;
        score.initUser();
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
        if (e.keyCode === KEY.N) {
            startNewGame();
        } else if (e.keyCode === KEY.S) {
            audio.disableSound();
            localStorage["soundDisabled"] = !soundDisabled();
        } else if (e.keyCode === KEY.P && state === PAUSE) {
            audio.resume();
            map.draw(ctx);
            setState(stored);
        } else if (e.keyCode === KEY.P) {
            stored = state;
            setState(PAUSE);
            audio.pause();
            map.draw(ctx);
            dialog("Paused");
        } else if (state !== PAUSE) {   
            return user.keyDown(e);
        }
        return true;
    }    

    function loseLife() {        
        setState(WAITING);
        score.loseLife();
        if (score.getLives() > 0) {
            startLevel();
        }
    }

    function setState(nState) { 
        state = nState;
        stateChanged = true;
    };
    
    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) + 
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function drawFooter() {
        
        var topLeft  = (map.height * map.blockSize),
            textBase = topLeft + 17;
        
        ctx.fillStyle = "#000";
        ctx.fillRect(0, topLeft, (map.width * map.blockSize), 30);
        
        ctx.fillStyle = "#FFFF00";

        for (var i = 0, len = score.getLives(); i < len; i++) {
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(150 + (25 * i) + map.blockSize / 2,
                       (topLeft+1) + map.blockSize / 2);
            
            ctx.arc(150 + (25 * i) + map.blockSize / 2,
                    (topLeft+1) + map.blockSize / 2,
                    map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.fill();
        }

        ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000";
        ctx.font = "bold 16px sans-serif";
        //ctx.fillText("♪", 10, textBase);
        ctx.fillText("s", 10, textBase);

        ctx.fillStyle = "#FFFF00";
        ctx.font      = "14px BDCartoonShoutRegular";
        ctx.fillText("Score: " + score.theScore(), 30, textBase);
        
        ctx.fillText("Level: " + level, 260, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y/10), Math.floor(pos.x/10), ctx);
        map.drawBlock(Math.ceil(pos.y/10), Math.ceil(pos.x/10), ctx);
    }

    function mainDraw() { 

        var     diff, u, i, len, nScore;
        
        enemyPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            enemyPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);//call move function under "user" object
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(enemyPos[i].old);
        }
        redrawBlock(u.old);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx); //redraw enemy status(call functionunder ghost object)
        }
        user.draw(ctx); //call draw function
        
        userPos = u["new"]; //get new position
        if(gameType === 1){
            for (i = 0, len = ghosts.length; i < len; i += 1) {
                
                if (collided(userPos, enemyPos[i]["new"])) {
                    //if pacman has eaten pills
                    if (ghosts[i].isVunerable()) { 
                        audio.play("eatghost");
                        ghosts[i].eat();//ghost got eaten
                        eatenCount += 1;
                        nScore = eatenCount * 50;
                        drawScore(nScore, enemyPos[i]);
                        score.addScore(nScore);                    
                        setState(EATEN_PAUSE);
                        timerStart = tick;
                    } else if (ghosts[i].isDangerous()) {
                        audio.play("die");
                        setState(DYING);
                        timerStart = tick;
                    }
                }
            }        
        }
        //none smoker mode
        if(gameType === 2){
            for (i = 0, len = ghosts.length; i < len; i += 1) {
                // if objects meet
                if(ghosts[i].checkDead()) continue;
                
                if (collided(userPos, enemyPos[i]["new"])) {
                    if (user.isVunerable()) { // user is weak 
                        audio.play("die");
                        user.eat(); //
                        setState(DYING); //set to DIE stage.
                        timerStart = tick;
                    } else if (user.isDangerous()) {
                        
                        audio.play("eatghost");// killed pacman
                        ghosts[i].setDead();
                        user.eatInc();
                        eatenCount += 1; 
                        nScore = eatenCount * 50;
                        drawScore(nScore, enemyPos[i]);
                        score.addScore(nScore); //add score

                        setState(EATEN_PAUSE);[]
                        timerStart = tick;
                    }
                }
            }

            var total=0,
                elim =0;
            
            for (i = 0, len = ghosts.length; i < len; i += 1){
                total= total + ghosts[i].getEat();
                elim = elim + ghosts[i].checkDead();
            }
            console.log(total);

            if(total === 182){
                audio.play("die");
                user.eat(); //
                map.reset();
                setState(DYING); //set to DIE stage.
            }
            if(elim === 4){
                for(i = 0;i<ghosts.length;i+=1)
                    ghosts[i].setAlive();   
                completedLevel();
            }
        }
                                 
    };

    function mainLoop() {

        var diff;

        if (state !== PAUSE) { 
            //loop counter
            ++tick;
        }

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {            
            stateChanged = false;
            map.draw(ctx);
            dialog("Press N to start a New game"); //back to initial state            
        } else if (state === EATEN_PAUSE && 
                   (tick - timerStart) > (Pacman.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);//start playing
        } else if (state === DYING) {
            if (tick - timerStart > (Pacman.FPS * 2)) { 
                loseLife();
            } else { 
                redrawBlock(userPos);
                for (i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(enemyPos[i].old);
                    enemyPos.push(ghosts[i].draw(ctx));
                }   

                if (gameType === 1) user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
                if (gameType === 2) user.draw(ctx);
            }
        } else if (state === COUNTDOWN) {
            
            diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);
            
            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING);
            } else {
                if (diff !== lastTime) { 
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        } 

        drawFooter();
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        if(gameType === 1){
            for (i = 0; i < ghosts.length; i += 1) {
                ghosts[i].makeEatable(ctx);
            }
        }
        
        if(gameType === 2){
            user.makeEatable(ctx);
        }
                
    };
    
    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();
        user.newLevel();
        completeFlag=1;
        if(gameType === 2)
            for (i = 0; i < ghosts.length; i += 1) {
                ghosts[i].setEaten();
            }
        startLevel();
    };

    function keyPress(e) { 
        if (state !== WAITING && state !== PAUSE) { 
            e.preventDefault();
            e.stopPropagation();
        }
    };
    
    function Menu(wrapper,root){
		var canvas = document.createElement("canvas"),
			blockSize = wrapper.offsetWidth / 19,
			height = blockSize *22,
			width = blockSize * 19,
			flag = 0,
            type = 0;
	    //set window size.
	    canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", height + 30 + "px");
 
	    //apply new child "canvas".
	    wrapper.appendChild(canvas);
	     
	    //指定2D繪圖
	    ctx  = canvas.getContext('2d');

		ctx.fillStyle = '#1a1a1a';//填滿的顏色    
	    ctx.fillRect(0, 0, width / 2, height);

	    ctx.fillStyle = '#857e7e';//填滿的顏色
		ctx.fillRect(width / 2 , 0,  width / 2, height);


	    ctx.fillStyle= '#c5c5c5';
	    ctx.font="25px Georgia";
		ctx.fillText("Smoker",45, height /2);

		ctx.font="25px Georgia";
		ctx.fillText("Non-smoker",190,height/2);

        ctx.fillStyle='#c5c5c5';
        ctx.font="16px Georgia";
        ctx.fillText("Click to choose game mode.",65,height*4/5);

		//mouse detection
		canvas.addEventListener('click',function(e){
			
			// console.log(e.clientX+','+e.clientY);
			var pos=wrapper.getBoundingClientRect();
            var el = document.getElementsByTagName("canvas")[0];

			if(e.clientX -  pos.left <= width/2 ){
				//console.log("type 1");
				// type=1;
                console.log(el.offsetWidth);
				if (flag ==0){
						gameType=1;
						init(el,root);
                        flag=1;
				}
                // e.preventDefault();//test part
                // e.stopPropagation();//test part
			}
			else{
				console.log("type 2");
				if (flag ==0){
					gameType=2;
					init(el,root);
                    flag=1;
				}
                // flag=2;
                // e.preventDefault();//test part
                // e.stopPropagation();//test part
			}
            // init(el,root,type);
            
		});

	};

    function init(wrapper,root) {
        
        var i, len, ghost,
            blockSize = wrapper.offsetWidth / 19;
            
		ctx  = wrapper.getContext('2d');

        audio = new Pacman.Audio({"soundDisabled":soundDisabled});
        
        //create map object
        map   = new Pacman.Map(blockSize);

        score = new Pacman.Score();

        if(gameType === 1){
        	//create user
        	user = new Pacman.User({ 
                "completedLevel" : completedLevel, 
                "eatenPill"      : eatenPill,
                "mode"           : MANUAL
        	}, map, score);

        	//create enemy
	        for (i = 0, len = Specs.length; i < len; i += 1) {
	            ghost = new Pacman.Ghost({"getTick":getTick,"mode" :AUTO}, map, null, Specs[i]);
	            ghosts.push(ghost);
	        }
        }
        //do if mode 2
        if(gameType ===2){
            user = new Pacman.Ghost({ 
            "completedLevel" : completedLevel, 
            "getTick"        : getTick,
            "mode"           : MANUAL
            }, map);

            //create enemy
            for (i = 0, len = Specs.length; i < len; i += 1) {
                ghost = new Pacman.User({
                    "getTick"   :getTick,
                    "eatenPill" : eatenPill,
                    "mode"      :AUTO
                }, map, null, Specs[i]);
                
                ghosts.push(ghost);
            }
        }
        

        //draw map file on canvas.
        map.draw(ctx);

        dialog("Loading ...");

        //use ogg if web browser is available ,or mp3 if it's not.
        var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        //set voice file
        var audio_files = [
            ["start", root + "audio/opening_song." + extension],
            ["die", root + "audio/die." + extension],
            ["eatghost", root + "audio/eatghost." + extension],
            ["eatpill", root + "audio/eatpill." + extension],
            ["eating", root + "audio/eating.short." + extension],
            ["eating2", root + "audio/eating.short." + extension]
        ];

        //load audio file
        load(audio_files, function() { loaded(); });
    };

    function load(arr, callback) { 
        
        if (arr.length === 0) { 
            callback();
        } else { 
            var x = arr.pop();
            audio.load(x[0], x[1], function() { load(arr, callback); });
        }
    };
        
    function loaded() {

        dialog("Press N to Start");
        
        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true); 
        
        timer = window.setInterval(mainLoop, 1000 / Pacman.FPS);
    };
    
    return {
        "Menu" : Menu
    };
    
}());




var KEY = {'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36, 'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40, 'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93, 'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110, 'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189, 'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220, 'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222};

(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();

Pacman.WALL    = 0;
Pacman.BISCUIT = 1;
Pacman.EMPTY   = 2;
Pacman.BLOCK   = 3;
Pacman.PILL    = 4;

Pacman.MAP = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

Pacman.WALLS = [
    
    [{"move": [0, 9.5]}, {"line": [3, 9.5]},
     {"curve": [3.5, 9.5, 3.5, 9]}, {"line": [3.5, 8]},
     {"curve": [3.5, 7.5, 3, 7.5]}, {"line": [1, 7.5]},
     {"curve": [0.5, 7.5, 0.5, 7]}, {"line": [0.5, 1]},
     {"curve": [0.5, 0.5, 1, 0.5]}, {"line": [9, 0.5]},
     {"curve": [9.5, 0.5, 9.5, 1]}, {"line": [9.5, 3.5]}],

    [{"move": [9.5, 1]},
     {"curve": [9.5, 0.5, 10, 0.5]}, {"line": [18, 0.5]},
     {"curve": [18.5, 0.5, 18.5, 1]}, {"line": [18.5, 7]},
     {"curve": [18.5, 7.5, 18, 7.5]}, {"line": [16, 7.5]},
     {"curve": [15.5, 7.5, 15.5, 8]}, {"line": [15.5, 9]},
     {"curve": [15.5, 9.5, 16, 9.5]}, {"line": [19, 9.5]}],

    [{"move": [2.5, 5.5]}, {"line": [3.5, 5.5]}],

    [{"move": [3, 2.5]},
     {"curve": [3.5, 2.5, 3.5, 3]},
     {"curve": [3.5, 3.5, 3, 3.5]},
     {"curve": [2.5, 3.5, 2.5, 3]},
     {"curve": [2.5, 2.5, 3, 2.5]}],

    [{"move": [15.5, 5.5]}, {"line": [16.5, 5.5]}],

    [{"move": [16, 2.5]}, {"curve": [16.5, 2.5, 16.5, 3]},
     {"curve": [16.5, 3.5, 16, 3.5]}, {"curve": [15.5, 3.5, 15.5, 3]},
     {"curve": [15.5, 2.5, 16, 2.5]}],

    [{"move": [6, 2.5]}, {"line": [7, 2.5]}, {"curve": [7.5, 2.5, 7.5, 3]},
     {"curve": [7.5, 3.5, 7, 3.5]}, {"line": [6, 3.5]},
     {"curve": [5.5, 3.5, 5.5, 3]}, {"curve": [5.5, 2.5, 6, 2.5]}],

    [{"move": [12, 2.5]}, {"line": [13, 2.5]}, {"curve": [13.5, 2.5, 13.5, 3]},
     {"curve": [13.5, 3.5, 13, 3.5]}, {"line": [12, 3.5]},
     {"curve": [11.5, 3.5, 11.5, 3]}, {"curve": [11.5, 2.5, 12, 2.5]}],

    [{"move": [7.5, 5.5]}, {"line": [9, 5.5]}, {"curve": [9.5, 5.5, 9.5, 6]},
     {"line": [9.5, 7.5]}],
    [{"move": [9.5, 6]}, {"curve": [9.5, 5.5, 10.5, 5.5]},
     {"line": [11.5, 5.5]}],


    [{"move": [5.5, 5.5]}, {"line": [5.5, 7]}, {"curve": [5.5, 7.5, 6, 7.5]},
     {"line": [7.5, 7.5]}],
    [{"move": [6, 7.5]}, {"curve": [5.5, 7.5, 5.5, 8]}, {"line": [5.5, 9.5]}],

    [{"move": [13.5, 5.5]}, {"line": [13.5, 7]},
     {"curve": [13.5, 7.5, 13, 7.5]}, {"line": [11.5, 7.5]}],
    [{"move": [13, 7.5]}, {"curve": [13.5, 7.5, 13.5, 8]},
     {"line": [13.5, 9.5]}],

    [{"move": [0, 11.5]}, {"line": [3, 11.5]}, {"curve": [3.5, 11.5, 3.5, 12]},
     {"line": [3.5, 13]}, {"curve": [3.5, 13.5, 3, 13.5]}, {"line": [1, 13.5]},
     {"curve": [0.5, 13.5, 0.5, 14]}, {"line": [0.5, 17]},
     {"curve": [0.5, 17.5, 1, 17.5]}, {"line": [1.5, 17.5]}],
    [{"move": [1, 17.5]}, {"curve": [0.5, 17.5, 0.5, 18]}, {"line": [0.5, 21]},
     {"curve": [0.5, 21.5, 1, 21.5]}, {"line": [18, 21.5]},
     {"curve": [18.5, 21.5, 18.5, 21]}, {"line": [18.5, 18]},
     {"curve": [18.5, 17.5, 18, 17.5]}, {"line": [17.5, 17.5]}],
    [{"move": [18, 17.5]}, {"curve": [18.5, 17.5, 18.5, 17]},
     {"line": [18.5, 14]}, {"curve": [18.5, 13.5, 18, 13.5]},
     {"line": [16, 13.5]}, {"curve": [15.5, 13.5, 15.5, 13]},
     {"line": [15.5, 12]}, {"curve": [15.5, 11.5, 16, 11.5]},
     {"line": [19, 11.5]}],

    [{"move": [5.5, 11.5]}, {"line": [5.5, 13.5]}],
    [{"move": [13.5, 11.5]}, {"line": [13.5, 13.5]}],

    [{"move": [2.5, 15.5]}, {"line": [3, 15.5]},
     {"curve": [3.5, 15.5, 3.5, 16]}, {"line": [3.5, 17.5]}],
    [{"move": [16.5, 15.5]}, {"line": [16, 15.5]},
     {"curve": [15.5, 15.5, 15.5, 16]}, {"line": [15.5, 17.5]}],

    [{"move": [5.5, 15.5]}, {"line": [7.5, 15.5]}],
    [{"move": [11.5, 15.5]}, {"line": [13.5, 15.5]}],
    
    [{"move": [2.5, 19.5]}, {"line": [5, 19.5]},
     {"curve": [5.5, 19.5, 5.5, 19]}, {"line": [5.5, 17.5]}],
    [{"move": [5.5, 19]}, {"curve": [5.5, 19.5, 6, 19.5]},
     {"line": [7.5, 19.5]}],

    [{"move": [11.5, 19.5]}, {"line": [13, 19.5]},
     {"curve": [13.5, 19.5, 13.5, 19]}, {"line": [13.5, 17.5]}],
    [{"move": [13.5, 19]}, {"curve": [13.5, 19.5, 14, 19.5]},
     {"line": [16.5, 19.5]}],

    [{"move": [7.5, 13.5]}, {"line": [9, 13.5]},
     {"curve": [9.5, 13.5, 9.5, 14]}, {"line": [9.5, 15.5]}],
    [{"move": [9.5, 14]}, {"curve": [9.5, 13.5, 10, 13.5]},
     {"line": [11.5, 13.5]}],

    [{"move": [7.5, 17.5]}, {"line": [9, 17.5]},
     {"curve": [9.5, 17.5, 9.5, 18]}, {"line": [9.5, 19.5]}],
    [{"move": [9.5, 18]}, {"curve": [9.5, 17.5, 10, 17.5]},
     {"line": [11.5, 17.5]}],

    [{"move": [8.5, 9.5]}, {"line": [8, 9.5]}, {"curve": [7.5, 9.5, 7.5, 10]},
     {"line": [7.5, 11]}, {"curve": [7.5, 11.5, 8, 11.5]},
     {"line": [11, 11.5]}, {"curve": [11.5, 11.5, 11.5, 11]},
     {"line": [11.5, 10]}, {"curve": [11.5, 9.5, 11, 9.5]},
     {"line": [10.5, 9.5]}]
];

Object.prototype.clone = function () {
    var i, newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i === 'clone') {
            continue;
        }
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        } else {
            newObj[i] = this[i];
        }
    }
    return newObj;
};



/*
=====================================
    2017/05/28 journal 
    bug : 
    	mouse detection --->fixed.
    todo list:
    	turn to game => second phase ---> finished.
    	change resolution
    	change art => skin
    	design second mode (non-smokers)
    	Pacman bot ai design (hardest)
    perhaps:
    	maps redesign?
    	menu hover effect

    =====================================
    2017/05/31 journal
    bug:
    	event listener is still working even the menu function is over. =>fixed.
    process:
    	copied game file.
    todo list:
    	fix conflict between Menu function and Init function. --->finished.
    	design second mode
    		->seperate movement patterns and spec patterns
    	change resolution
    	change art => skin
    	design second mode (non-smokers)
    	Pacman bot ai design (hardest)
    perhaps:
    	maps :redesign?
    	menu :hover effect
    =====================================
    2017/06/06

    current :
        pacman.Ghost description + movement 
        pacman.User  description + control  + score + init function

    target :
        pacman.Ghost description + control
        pacman.User description + control +score
        (new) control ->(auto or control)
        (new) score 
        if control -> class 1 or class 2

    todo list:
        (1).從 User 獨立score(計分)物件
        (2).從 Ghost 及user 獨立control(操作)物件 finish!
        (3).if control(next sprint)
=====================================
    basic game complete!
        bugs : enemy will not respawn in next Level
               Level will not be complete if enemies are eliminated in different lives
               when died by the special rule , biscuit will not reappear. 
*/
