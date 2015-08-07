/* global Asteroid, GameObject, Keys */

/**
 * The Player's object.
 *
 * @param {Number} x Player's x position
 * @param {Number} y Player's y position
 * @param {Game} game Game object reference
 */
function Player(x, y, game){
    GameObject.call(this, x, y, 15, game);

    this.moveTop = false;
    this.moveRight = false;
    this.moveBottom = false;
    this.moveLeft = false;
    this.fire = false;
    this.lastFireTime = 0;
    this.fireInterval = 200;
    this.crashed = false;
    this.outOfBoundsY = false;
    this.outOfBoundsX = false;
    this.outOfBounds = false;

    /**
     * Gun position relative to the center of scheme
     */
    this.gunPositionRelative = 15;

    /**
     * A depression angle
     * @param Number
     */
    this.angle = 2*Math.PI;
    /**
     * Acceleration of the player.
     * @param Number
     * TODO: it's do nothing!? Why is it here?
     */
    this.acceleration = 0;
    /**
     * Velocity of the player.
     * @param Number
     */
    this.velocity = 0;
};
Player.prototype = Object.create(GameObject.prototype);
/**
 * Refresh a Player state. This function to be called from the main loop.
 * @param {Array} keysPressed An array of all pressed keys
 */
Player.prototype.loopEvent = function(keysPressed){

    if( keysPressed.indexOf(Keys.UP) !== -1 ){
        this.moveTop = true;
    } else {
        this.moveTop = false;
    }

    if( keysPressed.indexOf(Keys.DOWN) !== -1 ){
        this.moveBottom = true;
    } else {
        this.moveBottom = false;
    }

    if( keysPressed.indexOf(Keys.LEFT) !== -1 ){
        this.moveLeft = true;
    }else {
        this.moveLeft = false;
    }

    if( keysPressed.indexOf(Keys.RIGHT) !== -1 ){
        this.moveRight = true;
    } else {
        this.moveRight = false;
    }

    if( keysPressed.indexOf(Keys.SPACE) !== -1 ){
        this.fire = true;
    } else {
        this.fire = false;
    }

};

Player.prototype.clearLoopCache = function(){
    this.cacheIsTop = this.cacheIsBottom = this.cacheIsLeft = this.cacheIsRight = this.cacheCenter = false;
};

Player.prototype.isTop = function(){
    if( !this.cacheIsTop )
        this.cacheIsTop = Math.toAbsDegrees(this.angle);
    return ( this.cacheIsTop > 270 || this.cacheIsTop < 90 );
};
Player.prototype.isBottom = function(){
    if( !this.cacheIsBottom || this.cacheIsBottom === undefined )
        this.cacheIsBottom = Math.toAbsDegrees(this.angle);
    return ( this.cacheIsBottom < 270 && this.cacheIsBottom > 90 );
};
Player.prototype.isRight = function(){
    if( !this.cacheIsRight || this.cacheIsRight === undefined )
        this.cacheIsRight = Math.toAbsDegrees(this.angle);

    return ( this.cacheIsRight > 0 && this.cacheIsRight < 180 );
};
Player.prototype.isLeft = function(){
    if( !this.cacheIsLeft || this.cacheIsLeft === undefined )
        this.cacheIsLeft = Math.toAbsDegrees(this.angle);
    return ( this.cacheIsLeft > 180 && this.cacheIsLeft < 360 );
};


/**
 * A step function to be called to move the player just before drawing him on the canvas.
 */
Player.prototype.step = function(){
    if( this.crashed ) {
        return;
    }
    this.clearLoopCache();

    var a = -0.08;
    if( this.moveTop ){
        a = 0.3;
    } else if( this.moveBottom ){
        a = -0.15;
    }

    if( this.moveLeft ){
        this.angle = this.angle - Math.PI/35;
    } else if( this.moveRight ){
        this.angle = this.angle + Math.PI/35;
    }


    this.velocity += a;
    if( this.velocity < 0 ){
        this.velocity = 0;
    }
    if( this.velocity > 10 ){
        this.velocity = 10;
    }

    var newX = this.x + Math.cos(this.angle - Math.PI/2) * this.velocity;
    var newY = this.y + Math.sin(this.angle - Math.PI/2) * this.velocity;

    this.x = newX;
    this.y = newY;

    //    //console.log( "player: ", player.indexOf(this), "y: ", newY );
    var yPlayer = null, xPlayer = null;

    //Drawing crossing over the canvas on the Y axis
    if( !this.outOfBoundsY && !this.outOfBoundsX && newY < 25 ){ //create new player object in the bottom of canvas
        yPlayer = new Player(newX, this.canvasSize[1]+newY, this.game);
        yPlayer.velocity = this.velocity;
        yPlayer.angle = this.angle;
        yPlayer.lastFireTime = this.lastFireTime;
        yPlayer.outOfBoundsY = true;
        this.game.player[this.game.player.length] = yPlayer;
        this.outOfBoundsY = true;
    }else if( this.outOfBoundsY && this.isTop() && newY < -20 ){
        this.game.removePlayer(this);
    } else if( !this.outOfBoundsY && !this.outOfBoundsX && newY > this.canvasSize[1]-20 ){
        yPlayer = new Player(newX, -(this.canvasSize[1]-newY), this.game);
        yPlayer.velocity = this.velocity;
        yPlayer.angle = this.angle;
        yPlayer.lastFireTime = this.lastFireTime;
        yPlayer.outOfBoundsY = true;
        this.game.player[this.game.player.length] = yPlayer;
        this.outOfBoundsY = true;
    } else if( this.outOfBoundsY && this.isBottom() && newY > this.canvasSize[1]+20 ){
        this.game.removePlayer(this);
    } else if( this.outOfBoundsY ){
        //The object is entire on the board - remove the flag.
        if( this.isTop() && newY > 40 && newY < this.canvasSize[1]-20 ){
            this.outOfBoundsY = false;
        } else if( this.isBottom() && newY < this.canvasSize[1]-20 && newY > 25){
            this.outOfBoundsY = false;
        }
    }
    //Drawing crossing over the canvas on the X axis
    if( !this.outOfBoundsX && !this.outOfBoundsY && newX < 20 ){
        xPlayer = new Player(this.canvasSize[0]+newX, newY, this.game);
        xPlayer.velocity = this.velocity;
        xPlayer.angle = this.angle;
        xPlayer.lastFireTime = this.lastFireTime;
        xPlayer.outOfBoundsX = true;
        this.game.player[this.game.player.length] = xPlayer;
        this.outOfBoundsX = true;
    } else if( this.outOfBoundsX && this.isLeft() && newX < -20 ){
        this.game.removePlayer(this);
    } else if( !this.outOfBoundsX && !this.outOfBoundsY && newX > this.canvasSize[0]-20 ){
        xPlayer = new Player(-(this.canvasSize[0]-newX), newY, this.game);
        xPlayer.velocity = this.velocity;
        xPlayer.angle = this.angle;
        xPlayer.lastFireTime = this.lastFireTime;
        xPlayer.outOfBoundsX = true;
        this.game.player[this.game.player.length] = xPlayer;
        this.outOfBoundsX = true;
    } else if( this.outOfBoundsX && this.isRight() && newX > this.canvasSize[0]+20 ){
        this.game.removePlayer(this);
    } else if( this.outOfBoundsX ){
        if( this.isLeft() && newX > 40 && newX < this.canvasSize[0]-20 ){
            this.outOfBoundsX = false;
        } else if( this.isRight() && newX < this.canvasSize[0]-20 && newX > 25){
            this.outOfBoundsX = false;
        }
    }



    var crashObj = this.game.isCollision(this,false);
    if( crashObj ){
        this.crashed = true;
        if( crashObj instanceof Asteroid ){
            crashObj.divide();
        }
        this.game.playerCrashedHandler();
        return;
    }

    if( /*!this.outOfBoundsY && !this.outOfBoundsY &&*/ this.fire ){
        var now = new Date().getTime();
        if( this.lastFireTime !== 0 && (now - this.lastFireTime) < this.fireInterval ){
            return;
        }
        this.lastFireTime = now;

        var posX = (this.gunPositionRelative * Math.cos( this.angle - Math.PI/2) + this.x);
        var posY = (this.gunPositionRelative * Math.sin( this.angle - Math.PI/2) + this.y);

        //TODO: create method in Game object
        var bullet = new Bullet(posX, posY, this.game, this.angle - Math.PI/2);
        this.game.bullets[this.game.bullets.length] = bullet;
    }

};
/**
 * Draw the Player.
 * @param {CanvasContext} ctx Canvas' context
 */
Player.prototype.draw = function(ctx){
    ctx.save();
    //log.innerHTML = this.x + " : " + this.y;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    var color = '#fff';

    if( this.crashed ){
        color = 'red';
    }
    //shape
    ctx.beginPath();
    ctx.fillStyle = color;
//    ctx.strokeStyle = "#D40000";
//    ctx.fillStyle = '#fff';
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.moveTo(0,-20);
    ctx.lineTo(-20,20);
    ctx.lineTo(20,20);
    ctx.fill();

    //gun
    //this.ctx.save();
    ctx.fillStyle = '#c00';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;
    ctx.fillRect(-1,-15,2,-8);


    //this.ctx.restore();

    //    ctx.fillStyle = '#000000';
    //    if( this.isRight() ){
    //        ctx.fillText('right',-9,15);
    //    } else if( this.isLeft() ) {
    //        ctx.fillText('left',-9,15);
    //    }


    ctx.restore();
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.strokeStyle = "#D40000";
  //  ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, 2 * Math.PI, true);
    ctx.stroke();
    ctx.restore();
};
