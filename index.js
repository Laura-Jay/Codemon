
/*
current plan: just re-export the collision JSON object to include a backborder to the platue
everything else looks pretty clean at -10 
re-export foreground objects to add plateu tree
*/

//set up screen area
const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// 70 is the number of horizontal tiles on the map
//convert JSON into array of arrays of length 70 to configure data to align with cavas dimensions
const collisionsMap = []
for (let i = 0; i< collisions.length; i+= 70){
    collisionsMap.push(collisions.slice(i, i+70))
}

//convert JSON into array of arrays of length 70 to configure data to align with cavas dimensions
const battleZonesMap = []
for (let i = 0; i< battleZonesData.length; i+= 70){
    battleZonesMap.push(battleZonesData.slice(i, i+70))
}

const boundaries = []
//this changes if map image changes, want to make it so player is middle
const offset = {
    x: -207,
    y: -1000
}

//if there is a red tile create a new boundary object and push it into the boundaries array
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
        boundaries.push(
            new Boundary({
                position: {
                 x: j * Boundary.width + offset.x,
                 y: i * Boundary.height + offset.y
                }
            })
        )
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
        battleZones.push(
            new Boundary({
                position: {
                 x: j * Boundary.width + offset.x,
                 y: i * Boundary.height + offset.y
                }
            })
        )
    })
})


const image = new Image()
image.src='/images/mainMapScaled.png'

const foregroundImage = new Image()
foregroundImage.src='/images/foregroundScaled.png'

const playerDownImage = new Image()
playerDownImage.src='./images/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src='./images/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src='./images/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src='./images/playerRight.png'

//create player avatar object 
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height/ 2 - 68 /2 
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage

    }
})

//create background object
const background = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: image
})

//create foreground object
const foreground = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: foregroundImage
})

//set keys.pressed = false on load
const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false}
}

//items that should move with the background (everything except player)
const movables = [background, ...boundaries, foreground, ...battleZones]

//remove the -numbers if you re-do map, this is just to allow moving through narrow zones 
//function to determine if player dimensions overlap with collision boundaries 
function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width -10 >= rectangle2.position.x && 
        rectangle1.position.x  <= rectangle2.position.x -10 + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y -30 + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y 
    )
}

//set battle = false on load 
const battle = {
    initiated: false
}

// animate top down view
function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach(boundary => {
        boundary.draw()

    })
    battleZones.forEach(battleZone => {
        battleZone.draw()

    })
    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false

    //early return if battle starts to prevent player movement
    if (battle.initiated) return

    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed ) {
         //battlezone detection
         for (let i = 0; i < battleZones.length; i++){
            const battleZone = battleZones[i]
            //ensures at least 50% of player is on battleZone to trigger battle
            const overLappingArea =
                ( Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                        )  -
                    Math.max(player.position.x, battleZone.position.x)) * 
                ( Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                        ) -
                    Math.max(player.position.y, battleZone.position.y))
            if ( 
                rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone
                }) &&
                overLappingArea > (player.width * player.height)/2
                && Math.random() < 0.05 // this determines frequency of battles
            ){
                //start battle sequence 
                //deactivate current top-down animation loop
                window.cancelAnimationFrame(animationId)

                battle.initiated = true

                //select html object and properties to animate with library
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                // activate a new animation loop
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                break 
            }
        }
    }

    //prevent player moving in current direction 3 pixels before collision with collision tile boundary
    if (keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up
        //collision tiles detection
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if ( 
                rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 3
                }}
                })
            ){
               moving = false
               break 
            }
        }

        if (moving)
        movables.forEach((movable) => {
            movable.position.y+= 3
        })
    } else if (keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if ( 
                rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y -3
                }}
                })
            ){
               moving = false
               break 
            }
        }
        if (moving)
        movables.forEach((movable) => {
        movable.position.y-= 3
    })}
    else if (keys.a.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if ( 
                rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + 3,
                    y: boundary.position.y 
                }}
                })
            ){
               moving = false
               break 
            }
        }
        if (moving)
        movables.forEach((movable) => {
        movable.position.x+= 3
    })}
    else if (keys.d.pressed && lastKey === 'd') { 
        player.animate = true
        player.image = player.sprites.right
        for (let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if ( 
                rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x -3,
                    y: boundary.position.y
                }}
                })
            ){
               moving = false
               break 
            }
        }
        if (moving)
        movables.forEach((movable) => {
        movable.position.x-= 3
    })}
}
animate()

// create battle background object 
const battleBackgroundImage = new Image()
battleBackgroundImage.src="/images/battleBackground.png"
const battleBackground = new Sprite({
    position: {
        x: 0, 
        y: 0
    },
    image: battleBackgroundImage
})

//create opponent sprite object
const draggleImage = new Image()
draggleImage.src="/images/draggleSprite.png"
const draggle = new Sprite( {
    position: {
        x: 800,
        y: 100
    },
    image: draggleImage,
    frames: {
        max: 4,
        hold: 30
    },
    animate: true,
    isEnemy: true
})

//create player codemon sprite object
const embyImage = new Image()
embyImage.src="/images/embySprite.png"
const emby = new Sprite( {
    position: {
        x: 280,
        y: 325
    },
    image: embyImage,
    frames: {
        max: 4,
        hold: 30
    },
    animate: true
})

// render attack spite animations e.g. fireball 
const renderedSprites = []
function animateBattle() { 
    window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    draggle.draw()
    emby.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}
//animate 
// if (battle.initiated) animateBattle()
animateBattle()  //remove after testing battle sequence 

//event listeners for attack buttons 
document.querySelectorAll('button'). forEach(button => {
    button.addEventListener('click', (event) => {
        const slectedAttack = attacks[event.currentTarget.innerHTML]
        emby.attack({ 
            attack: slectedAttack,
            recipient: draggle,
            renderedSprites: renderedSprites
        })
    })
})

//event listeners for player movement
let lastKey = ''
window.addEventListener('keydown', (event) => {
    switch (event.key){
        case 'w': 
        keys.w.pressed = true
        lastKey = 'w'
        break
        case 'a':
        keys.a.pressed = true
        lastKey = 'a'
        break
        case 's':
        keys.s.pressed = true
        lastKey = 's'
        break
        case 'd':
        keys.d.pressed = true
        lastKey = 'd'
    }
})

window.addEventListener('keyup', (event) => {
    switch (event.key){
        case 'w': 
        keys.w.pressed = false
        break
        case 'a':
        keys.a.pressed = false
        break
        case 's':
        keys.s.pressed = false
        break
        case 'd':
        keys.d.pressed = false
    }
})
