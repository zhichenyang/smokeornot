Pacman.User = function (game, map, score, colour) {
    var eaten     = null,
        eliminate = null,
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
        eliminate = null;
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
        eliminate = true;
    };

    function checkDead(){
        return eliminate;
    };

    function move(ctx) {

        var nextWhole   = null, 
            block       = null;
        
        var ret_pos;
        if(eliminate === null){
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
        if(eliminate !== true){

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