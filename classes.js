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
        isEnemy = false
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
        this.health = 100
        this.isEnemy = this.isEnemy
    }

    draw() {
        context.save()
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

    //animate attacks 
    attack({attack, recipient, renderedSprites}) {
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
                    animate: true
                })
                renderedSprites.push(ember)

                gsap.to(ember.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: () => {
                        renderedSprites.pop()
                    }
                })

            break;
            case 'Tackle':
                const timeline = gsap.timeline()

                this.health -= attack.damage 
        
                let movementDistance = 20
                if (this.isEnemy) movementDistance = -20
        
                let healthBar = '#enemyHealthBar'
                if (this.isEnemy) healthBar = '#playerHealthBar'
        
                timeline.to(this.position, {
                    x: this.position.x -movementDistance,  
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete:() => {
                        //Enemy gets hit 
                        gsap.to(healthBar, {
                            width: this.health - attack.damage + '%'
                        })
        
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