
/*
current video position: 3hrs:26
improvements: either make a new map or redraw the boundary to prevent overlaps
current plan: just re-export the collision JSON object to include a backborder to the platue
everything else looks pretty clean at -10 

*/

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

// 70 is the number of horizontal tiles on the map
const collisionsMap = []
for (let i = 0; i< collisions.length; i+= 70){
    collisionsMap.push(collisions.slice(i, i+70))
}

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


const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height/ 2 - 68 /2 
    },
    image: playerDownImage,
    frames: {
        max: 4
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage

    }
})

const background = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
    x: offset.x,
    y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: {pressed: false},
    a: {pressed: false},
    s: {pressed: false},
    d: {pressed: false}
}

const movables = [background, ...boundaries, foreground, ...battleZones]

//remove the -numbers if you re-do map, this is just to allow moving through narrow zones 
function rectangularCollision({rectangle1, rectangle2}) {
    return (
        rectangle1.position.x + rectangle1.width -10 >= rectangle2.position.x && 
        rectangle1.position.x  <= rectangle2.position.x -10 + rectangle2.width &&
        rectangle1.position.y <= rectangle2.position.y -30 + rectangle2.height &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y 
    )
}

const battle = {
    initiated: false
}

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
    player.moving = false

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
                console.log('activate battle')

                //deactivate current animation loop
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

    if (keys.w.pressed && lastKey === 'w') {
        player.moving = true
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
        player.moving = true
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
        player.moving = true
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
        player.moving = true
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

const battleBackgroundImage = new Image()
battleBackgroundImage.src="/images/battleBackground.png"
const battleBackground = new Sprite({
    position: {
        x: 0, 
        y: 0
    },
    image: battleBackgroundImage
})
function animateBattle() { 
    window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
}

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
