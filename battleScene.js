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

let draggle
let emby 
let renderedSprites
let queue
let battleAnimationId

function initBattle() { 
    //show User Interface 
    document.querySelector('#userInterface').style.display = 'block'
    document.querySelector('#dialougeBox').style.display = 'none'
    document.querySelector('#enemyHealthBar').style.width = '100%'
    document.querySelector('#playerHealthBar').style.width = '100%'
    document.querySelector('#attacksBox').replaceChildren() 

    //create monster sprite objects
    draggle = new Monster(monsters.Draggle)
    emby = new Monster(monsters.Emby)

    // render sprites
    renderedSprites = [draggle, emby]
    queue = []

    emby.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attacksBox').append(button)
    })

    //event listeners for attack buttons 
    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (event) => {
            const slectedAttack = attacks[event.currentTarget.innerHTML]
            emby.attack({ 
                attack: slectedAttack,
                recipient: draggle,
                renderedSprites
            })

            if (draggle.health <= 0){
                queue.push(() => {
                    draggle.faint()
                })
                queue.push(() => {
                    //fade to black
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationId)
                            animate()
                            document.querySelector('#userInterface').style.display='none'

                            gsap.to('#overlappingDiv', {
                                opacity: 0
                            })

                            battle.initiated=false
                            audio.Map.play()
                        }
                    })
                })
            }


            //enemy attacks 
        const randomAttack =  draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

            queue.push(() => {
                draggle.attack({ 
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })

                if (emby.health <= 0){
                    queue.push(() => {
                        emby.faint()
                    })

                    queue.push(() => {
                        //fade to black
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationId)
                                animate()
                                document.querySelector('#userInterface').style.display='none'
                                
                                gsap.to('#overlappingDiv', {
                                    opacity: 0
                                })


                                battle.initiated=false
                                audio.Map.play()
                            }
                        })
                    })
                }

            })
        })

        button.addEventListener('mouseenter', (event) => {
            const selectedAttack = attacks[event.currentTarget.innerHTML]
            document.querySelector('#attackType').innerHTML = selectedAttack.type
            document.querySelector('#attackType').style.color = selectedAttack.colour
        })
    })
}

function animateBattle() { 
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}

animate()

//have these two on and above off for testing and bug fixing in battle animations only 
// initBattle()
// animateBattle()


document.querySelector('#dialougeBox').addEventListener('click', (event) => {
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    } else event.currentTarget.style.display = 'none'
})