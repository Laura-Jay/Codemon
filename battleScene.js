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
const draggle = new Monster(monsters.Draggle)

//create player codemon sprite object
const emby = new Monster(monsters.Emby)

// render attack spite animations e.g. ember 
const renderedSprites = [draggle, emby]

emby.attacks.forEach((attack) => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacksBox').append(button)
})

function animateBattle() { 
    window.requestAnimationFrame(animateBattle)
    battleBackground.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}

//animate 
// if (battle.initiated) animateBattle()
animateBattle()  //remove after testing battle sequence 

const queue = []

//event listeners for attack buttons 
document.querySelectorAll('button'). forEach(button => {
    button.addEventListener('click', (event) => {
        const slectedAttack = attacks[event.currentTarget.innerHTML]
        emby.attack({ 
            attack: slectedAttack,
            recipient: draggle,
            renderedSprites: renderedSprites
        })
        queue.push(() => {
            draggle.attack({ 
                attack: attacks.Tackle,
                recipient: emby,
                renderedSprites: renderedSprites
            })
        })
    })
})

document.querySelector('#dialougeBox').addEventListener('click', (event) => {
    if (queue.length > 0) {
        queue[0]()
        queue.shift()
    } else event.currentTarget.style.display = 'none'
})