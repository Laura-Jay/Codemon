class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
        //to make collision map transparent change end val of fillStyle to 0, to see use 0.2
        context.fillStyle = 'rgba(255,0,0, 0.2'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

class Sprite {
    constructor({
        position, 
        image, 
        frames = { max: 1, hold: 10}, 
        sprites, 
        animate = false,
        rotation = 0,
     }) {

        this.position = position
        this.image = image
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image.onload = () => {
        this.width = this.image.width / this.frames.max
        this.height = this.image.height 
        }
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
       
    }

    draw() {
        context.save()
        context.translate(this.position.x + this.width/2, this.position.y + this.height/2)
        context.rotate(this.rotation) 
        context.translate(-this.position.x - this.width/2, -this.position.y - this.height/2)
        context.globalAlpha = this.opacity
        context.drawImage(
            this.image, 
            this.frames.val * this.width,
            0,
            this.image.width/ this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width/ this.frames.max,
            this.image.height
        ) 
        context.restore()


        if (!this.animate) return

        if (this.frames.max > 1){
        this.frames.elapsed++
        }

        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
    }
}

//extends gives all properties of the class referenced 
class Monster extends Sprite {

    constructor({
        position, 
        image, 
        frames = { max: 1, hold: 10}, 
        sprites, 
        animate = false,
        rotation = 0,
        isEnemy = false,
        name,
        attacks
    }) {
        super({
            position, 
            image, 
            frames, 
            sprites,
            animate,
            rotation
        })
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }
    //animate attacks 
    attack({attack, recipient, renderedSprites}) {
        document.querySelector('#dialougeBox').style.display = 'block'
        document.querySelector('#dialougeBox').innerHTML = this.name + ' used ' + attack.name

        let healthBar = '#enemyHealthBar'
        if (this.isEnemy) healthBar = '#playerHealthBar'

        let rotation = 1 // 1 radian
        if (this.isEnemy) rotation = -2.5

        this.health -= attack.damage 

        switch (attack.name) {
            case 'Ember':
                const emberImage = new Image()
                emberImage.src='./images/fireball.png'

                const ember = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: emberImage,
                    frames: {
                        max: 4, 
                        hold: 10
                    },
                    animate: true,
                    rotation: rotation
                })
                //start rendering ember sprite
                renderedSprites.splice(1,0, ember)
                
                //ember spite path from player monster to enemy monster
                gsap.to(ember.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {

                        //Enemy gets hit 

                        //reduce enemy health bar
                        gsap.to(healthBar, {
                            width: this.health - attack.damage + '%'
                        })

                        //attack hit animation

                        //shake enemy
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        //flicker enemy 
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        //stop rendering ember sprite
                        renderedSprites.splice(1,1)
                    }
                })

            break;
            case 'Tackle':
                const timeline = gsap.timeline() 
        
                let movementDistance = 20
                if (this.isEnemy) movementDistance = -20
        
                timeline.to(this.position, {
                    x: this.position.x -movementDistance,  
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete:() => {

                        //Enemy gets hit 

                        //reduce enemy health bar
                        gsap.to(healthBar, {
                            width: this.health - attack.damage + '%'
                        })

                        //attack hit animation
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
        
                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x 
                })
            break;
        }
        
    }
}