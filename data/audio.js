const audio = {
    Map: new Howl({
        src: './audio/map.wav',
        html5: true,
        volume: 0.1
    }),
    InitBattle: new Howl({
        src: '/audio/initBattle.wav',
        html5: true,
        volume: 0.1
    }),
    Battle: new Howl({
        src: '/audio/battle.mp3',
        html5: true,
        volume: 0.1
    }),
    TackleHit: new Howl({
        src: '/audio/tackleHit.wav',
        html5: true,
        volume: 0.1
    }),
    EmberHit: new Howl({
        src: '/audio/fireballHit.wav',
        html5: true,
        volume: 0.1
    }),
    InitEmber: new Howl({
        src: '/audio/initFireball.wav',
        html5: true,
        volume: 0.1
    }),
    Victory: new Howl({
        src: '/audio/victory.wav',
        html5: true,
        volume: 0.1
    })
}