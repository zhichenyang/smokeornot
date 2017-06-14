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