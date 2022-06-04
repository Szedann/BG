class Player {
        constructor(x, y, dir, hp, dmg, def, interval, range, color, type, size = 1){
                this.initialX = x
                this.initialY = y
                this.dir = dir
                this.hp = hp
                this.dmg = dmg
                this.def = def
                this.interval = interval
                this.range = range
                this.color = color
                this.type = type
                this.size = size
                this._moveTimer = randInt(0,interval)
                this.x = this.initialX
                this.y = this.initialY
        }
        nextTick () {
                if(this._moveTimer >= this.interval){
                        this._moveTimer = 0
                        return true
                }
                this._moveTimer++
                return false
        }
}



function resetScore(){
        whiteWins = 0
        blackWins = 0
        document.getElementById("whiteWins").innerText = "0"
        document.getElementById("blackWins").innerText = "0"
}

const tickTime = 1/120
const moveTime = 5
const moveTimer = 0
const tileSize = 10
let whiteWins = 0
let blackWins = 0
const infiniteMode = false
const playerColor = "white"
const enemyColor = "black"

const randInt = (from, to)=>{
        return Math.floor(Math.random()*to-from)+from
}
const colorTypes = {
        "sniper": "red",
        "sonic": "blue",
        "boss": "green"
}
const gracze = []
const enemies = []
const randomPlayer = (x, y, color)=>{
        if(Math.random()>.95){
                if(Math.random()>.5) return new Player(x, y, 1, 120, 1000, randInt(0,100), 700, 600, color, "sniper")
                else if(Math.random()>.7) return new Player(x, y, 1, 5000, 500, 1000, 10, 5, color, "boss", 2)
                return new Player(x, y, 1, 30, 100, randInt(0,100), 0, 1, color, "sonic")
        }
        const weight = randInt(10,100)
        const interval = (weight/10)+randInt(1,4)
        const hp = (weight**1.5)*(Math.random()+.4)
        const dmg = (weight**1.5)*(Math.random()+.4)

        return new Player(x, y, 1, hp, dmg, randInt(0,100), interval, randInt(1,5), color)
}

window.addEventListener('keyup', e=>{
        switch(e.key){
                case "s": resetScore(); break;
                case "g": startGame(); break;
        }
})

function startGame(){
        gracze.splice(0,gracze.length)
        enemies.splice(0,enemies.length)

        const amount = 50

        const enemyX = 180

        for (let index = 1; index < amount; index++) {
                enemies.push(randomPlayer(enemyX,(index*2), enemyColor))
        }
        
        for (let index = 1; index < amount; index++) {
                gracze.push(randomPlayer(2,(index*2), playerColor))
        }
}
startGame()

setInterval(loop, tickTime*1000);


function draw(x, y, c, w = 1, h = 1) {
        canvas = document.getElementById("1");
        ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.fillStyle = c;
        ctx.fillRect(x*tileSize, y*tileSize, tileSize*w, tileSize*h);
}

function move(o,x,y){
        o.x+=x
        o.y+=y
}

function attack(b, a){
        a.hp -= Math.max(b.dmg - a.def, 0)
        a.def -= Math.min(a.def, b.dmg)
        console.log(`${b.color} zadaje ${a.color} ${a.dmg}dmg po czym zostaje mu ${a.hp}hp i ${a.def}def`)
        
        if(a.hp<=0){
                const enemyIndex = enemies.findIndex(p=>p==a)
                if(enemyIndex!=-1){
                        enemies.splice(enemyIndex,1)
                        if(infiniteMode) enemies.push(randomPlayer(a.initialX, a.initialY, enemyColor))
                        return
                } 
                const playerIndex = gracze.findIndex(p=>p==a)
                if(playerIndex!=-1){
                        gracze.splice(playerIndex,1)
                        if(infiniteMode) gracze.push(randomPlayer(a.initialX, a.initialY, playerColor))
                }
        }
}


function drawGame(){
        canvas = document.getElementById("1");
        ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (const gracz of gracze) {
                let color = gracz.color
                if(gracz.type && colorTypes[gracz.type] && gracz._moveTimer<100) color = colorTypes[gracz.type]
                if(gracz.hp>0) draw(gracz.x, gracz.y, color, gracz.size, gracz.size)
        }
        for (const enemy of enemies) {
                let color = enemy.color
                if(enemy.type && colorTypes[enemy.type] && enemy._moveTimer<100) color = colorTypes[enemy.type]
                if(enemy.hp>0) draw(enemy.x, enemy.y, color, enemy.size, enemy.size)
        }
}

function groupUpdate(players, opponents){
        for (const gracz of players) {
                if(gracz.hp<=0) continue
                if(!gracz.nextTick()) continue
                let closestOpponent = new Player()
                let smallestDistance
                for (const opponent of opponents.filter(p=>p.hp>0)) {
                        const distance = Math.sqrt(((gracz.x - opponent.x)**2)+((gracz.y - opponent.y)**2))
                        if(distance > smallestDistance) continue
                        closestOpponent = opponent
                        smallestDistance = distance
                }
                if(!smallestDistance) continue
                const distanceX = closestOpponent.x-gracz.x
                const distanceY = closestOpponent.y-gracz.y
                dirX = Math.max(Math.min(distanceX,1), -1)
                dirY = Math.max(Math.min(distanceY,1), -1)
                // if(gracz.type == "sniper") gracz.interval = smallestDistance*100
                
                if(smallestDistance <= gracz.range){
                        console.log("atakowanie", gracz.color, closestOpponent.color)
                        attack(gracz, closestOpponent)
                }
                if(gracz.type == 'sniper') continue
                if(Math.abs(distanceX)>Math.abs(distanceY)) dirY = 0;
                else dirX = 0;
                canMove = [...players.filter(p=>p.hp>0), ...opponents.filter(p=>p.hp>0)].find(player=>
                        (player.x-(gracz.x+dirX)==gracz.size+player.size-2)
                        &&
                        (player.y-(gracz.y+dirY)==gracz.size+player.size-2)
                        ) 
                        ? false 
                        : true
                if(canMove) move(gracz, dirX, dirY)
        }
}

function loop(){
        var aliveEnemies = 0
        var alivePlayers = 0
        for (const gracz of gracze) {
                if(gracz.hp>0) alivePlayers++
        }
        for (const enemy of enemies) {
                if(enemy.hp>0) aliveEnemies++
        }
        if (aliveEnemies==0){
                whiteWins+=1
                document.getElementById("whiteWins").innerText = whiteWins
                startGame()
        }
        if (alivePlayers==0){
                blackWins+=1
                document.getElementById("blackWins").innerText = blackWins
                startGame()
        }
        groupUpdate(gracze, enemies)
        groupUpdate(enemies, gracze)

        drawGame()      
}