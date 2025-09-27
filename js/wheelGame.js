    let fortuneWheelGame;
    let coinSpinAnim;
    var wheelConfig;
    var reelNumber = 0;

    // window loads event
    window.onload = function() {
        var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); // detecção real de mobile

        var gameConfig = {    
        type: Phaser.WEBGL,
        backgroundColor: 0x2c2c2c,
        scene: [FortuneWheelUnderwater8],

        audio: {},

        scale: {
            width: isMobile ? window.innerWidth : 1920,
            height: isMobile ? window.innerHeight : 1080,
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
        };
    
        fortuneWheelGame = new Phaser.Game(gameConfig);
        window.focus();
    }

    // FortuneWheel scene
    class CommonWheel extends Phaser.Scene{
    
        setWheelConfig(){ }

        // method to be executed when the scene preloads
        preload(){
            this.setWheelConfig();

            // loading images
            wheelConfig.sprites.forEach((s) => {
                if (this.textures.exists(s.name)) {
                    this.textures.remove(s.name);
                }

                if (s.fileName != null) {
                    // 🔹 Se o fileName já for base64, carrega direto
                    if (s.fileName.startsWith("data:image")) {
                        this.load.image(s.name, s.fileName);
                    } 
                    // 🔹 Se for arquivo normal, usa o caminho padrão
                    else {
                        this.load.image(s.name, wheelConfig.assetPath + "png/" + s.fileName);
                        this.load.image('logo_topo', wheelConfig.assetPath + "png/logo.png");
                    }
                }
            });

            if (this.textures.exists("coinspin")) this.textures.remove("coinspin");
            this.load.spritesheet("coinspin", wheelConfig.assetPath + "png/CoinSheet.png", { 
                frameWidth: 100, 
                frameHeight: 100 
            });

            // set config variables
            this.usePointer = (
                this.getSpriteData('pointer') != null && 
                this.getSpriteData('pointer').fileName != null
            );

            // loading sounds
            this.load.audio('pointer_hit_clip', [
                'audio/pointer_hit.ogg', 
                'audio/pointer_hit.mp3'
            ]);  
            this.load.audio('win_clip', [
                'audio/win_sound.ogg',
                'audio/win_sound.mp3'
            ]);

                        // 🔹 popup do carro
            this.load.image('popup_car', wheelConfig.assetPath + "png/popup_car.png");

            // 🔹 som de fogos/palmas
            this.load.audio('fireworks_sound', [
                'audio/applause-cheer-236786.mp3'
            ]);

            // 🔹 carrega imagem do popup do carro
            this.load.image('popup_car', wheelConfig.assetPath + "png/popup_car.png");

            // loading bitmap fonts
            wheelConfig.fonts.forEach((f) => {
                this.load.bitmapFont(f.fontName, f.filePNG, f.fileXML);
            });
        }


        // method to be executed once the scene has been created
create(){
    this.sectorsCount = wheelConfig.sectors.length;
    this.sectorsText = [];

    this.gameWidth = fortuneWheelGame.config.width;
    this.gameHeight = fortuneWheelGame.config.height;
    this.centerX = (this.gameWidth / 2) + wheelConfig.centerOffsetX;
    this.centerY = (this.gameHeight / 2) + wheelConfig.centerOffsetY;

    // cria a roleta
    wheelConfig.createWheel(this);

    // adiciona o logo acima
    this.logo = this.add.image(this.centerX, this.centerY - 380, 'logo_topo')
        .setOrigin(0.5)
        .setScale(0.4);

    // faz o logo pulsar
    this.tweens.add({
        targets: this.logo,
        scale: 0.42,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    // sons
    this.pointer_hit_clip = this.sound.add('pointer_hit_clip');
    this.win_clip = this.sound.add('win_clip');

    // animação moedas
    coinSpinAnim = this.anims.create({
        key: 'spin',
        frames: this.anims.generateFrameNumbers('coinspin'),
        frameRate: 16,
        repeat: -1
    });

    this.coinParticles = this.add.particles('coinspin');


            // REMOVIDO: inicialização deve ser feita dentro de um método (ex: create)

        
            this.coinParticles = this.add.particles('coinspin');
            
            this.scale.on('resize', function (gameSize) // https://newdocs.phaser.io/docs/3.55.1/Phaser.Scale.Events.RESIZE
            {
                this.renderer.resize(window.innerWidth, window.innerHeight);    // force resize canwas, 
                this.setCamera();
            }, this);

            this.setCamera();

            // the game has just started and we can spin the wheel
            this.canSpin = true;
            this.animPointerComplete = true;      
            
        // this.showCoins();
        
        this.fscenes = ['FortuneWheelUnderwater8'];
        
        }

        setCamera() {
            var cWidth = this.sys.game.canvas.width;
            var cHeight = this.sys.game.canvas.height;

            this.cameras.resize(cWidth, cHeight);

            var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (this.cameras.main) {
                if (isMobile) {
                    // 🔹 Mobile continua responsivo
                    var zoomY = cHeight / fortuneWheelGame.config.height;
                    var zoomX = cWidth / fortuneWheelGame.config.width;
                    var zoom = Math.min(zoomX, zoomY);
                    this.cameras.main.setZoom(zoom);

                    var offsetY = (cHeight - fortuneWheelGame.config.height * zoom) / 2;
                    var offsetX = (cWidth - fortuneWheelGame.config.width * zoom) / 2;
                    this.cameras.main.scrollY = offsetY;
                    this.cameras.main.scrollX = offsetX;
                } else {
                    // 🔹 Desktop diminui bastante o zoom e centraliza
                    let zoom = 0.6; // <<< ajusta aqui: 0.5, 0.6, 0.65...
                    this.cameras.main.setZoom(zoom);

                    var offsetY = (cHeight - fortuneWheelGame.config.height * zoom) / 2;
                    var offsetX = (cWidth - fortuneWheelGame.config.width * zoom) / 2;
                    this.cameras.main.scrollY = offsetY;
                    this.cameras.main.scrollX = offsetX;
                }
            }
        }




        update(time, delta) // https://newdocs.phaser.io/docs/3.52.0/focus/Phaser.Scene-update
        {   
        //  console.log('elapsed time: ' + this.game.time.totalElapsedSeconds());
        if(!this.canSpin)
        {
            if(this.usePointer && this.animPointerComplete && this.wheelSpeed > 0.1)
            {
                this.pointerTweenDuration = 360/this.wheelSpeed/this.sectorsCount;
                this.animPointer();
            }
        }
        }

        // function to spin the wheel
        spinWheel(){

            var oldTime;    // spin tween elapsed time 
            var oldValue;   // spin tween last value  

            // can we spin the wheel?
            if(this.canSpin){

                wheelConfig.cancelsectorWinAnim(this);

                if(this.coinsEmitter!=null)
                {
                    this.coinsEmitter.stop();
                }

                this.win_clip.stop(); // this.wheel_spin_clip.setLoop(true); this.wheel_spin_clip.play();

                // resetting text field
                this.prizeText.setText("Aguarde ...");

                // the wheel will spin round for some times. 
                var rounds = Phaser.Math.Between(wheelConfig.wheelRounds.min, wheelConfig.wheelRounds.max);

                // then will rotate by a random number from 0 to 360 degrees. This is the actual spin
                this.rand_sector = 0;
                var rand_degrees = this.rand_sector * 360/wheelConfig.sectors.length;

                // then will rotate back by a random amount of degrees
                var backDegrees = Phaser.Math.Between(wheelConfig.backSpin.min, wheelConfig.backSpin.max);

                // now the wheel cannot spin because it's already spinning
                this.canSpin = false;

                // animation tweeen for the spin
                this.tweens.add({              
                    targets: [this.wCont],                                  // adding the wheel to tween targets               
                    angle: 360 * rounds + rand_degrees + backDegrees,       // angle destination           
                    duration: Phaser.Math.Between(
                        wheelConfig.rotationTimeRange.min, 
                        wheelConfig.rotationTimeRange.max
                    ),    
                    ease: "Cubic.easeOut",                          // tween easing               
                    callbackScope: this,                            // callback scope           
                    onComplete: function(tween){                    // function to be executed once the tween has been completed
                        this.showCoins();                 
                        this.tweens.add({                           // another tween to rotate a bit in the opposite direction
                            targets: [this.wCont],
                            angle: this.wCont.angle - backDegrees,
                            duration: Phaser.Math.Between(
                                wheelConfig.rotationTimeRange.min, 
                                wheelConfig.rotationTimeRange.max
                            ) / 8,
                            ease: "Cubic.easeIn",
                            callbackScope: this,
                            onComplete: function(tween_1){
                                this.prizeText.setText(
                                    wheelConfig.sectors[this.rand_sector].text
                                );  // displaying prize text  
                                
                                // insert here your win event handler
                                console.log('spin complete');                          
                                this.canSpin = false;    // 🔒 trava a roleta até fechar popup
                                wheelConfig.sectorWinAnim(this);                                        
                                this.win_clip.play();

                                // espera 5 segundos e mostra popup
                                this.time.delayedCall(5000, () => {
                                    this.showPrizePopup('popup_car');
                                });
                            }
                        })
                    },
                    onUpdate : function(tween)
                    {
                        var dValue= tween.getValue([0]) - oldValue;
                        var dTime = tween.elapsed - oldTime;
                        this.wheelSpeed = (dTime!=null) ? dValue/dTime : 0;
                        oldTime = tween.elapsed;
                        oldValue = tween.getValue([0]);  
                    }
                });

            }
       }

        animPointer()
        {
            var dir = (wheelConfig.animPointerDir && wheelConfig.animPointerDir < 0) ? -1 : 1;
            this.animPointerComplete = false;
            this.tweens.add({
                targets: [this.pointer],
                angle: -15 * dir,
                duration: this.pointerTweenDuration * 5/6,
                ease: "Cubic.easeOut",
                callbackScope: this,
                onComplete: function(tween)
                {
                    this.pointer_hit_clip.play();
                    this.tweens.add({
                        targets: [this.pointer],
                        angle: this.pointer.angle + 15 * dir,
                        duration: this.pointerTweenDuration * 1/6,
                        ease: "Cubic.easeIn",
                        callbackScope: this,
                        onComplete: function(tween)
                        {
                            this.animPointerComplete = true;
                        }
                    })
                },
            
            });
        }

        animLightSector()
        {
            var loopsCount = 0;     // lightTween loops counter
            this.lightTween =  this.tweens.add({
                targets: this.lightsector,
                alphaTopLeft: { value: 1, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaTopRight: { value: 1, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaBottomRight: { value: 1, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaBottomLeft: { value: 1, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                yoyo: true,
                loop: 5,
                callbackScope: this,
                onLoop: function(tween)
                {
                    loopsCount++;
                    if(loopsCount == 2)               // stop coins emitter
                    {                     
                        this.coinsEmitter.stop();     // this.coins_clip.play();
                    }
                },
            
            });
        }

        animTextSector()
        {
            var loopsCount = 0;     //tween loops counter
            this.sectorTextTween =  this.tweens.add({
                targets: this.sectorsText[this.rand_sector],
                alphaTopLeft: { value: 0, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaTopRight: { value: 0, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaBottomRight: { value: 0, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                alphaBottomLeft: { value: 0, duration: wheelConfig.lightTweenDuration, ease: 'Power1' },
                yoyo: true,
                loop: 5,
                callbackScope: this,
                onLoop: function(tween)
                {
                    loopsCount++;
                    if(loopsCount == 2)               // stop coins emitter
                    {                     
                        this.coinsEmitter.stop();     // this.coins_clip.play();
                    }
                },           
            });
        }

        showCoins()
        {
            this.coinsEmitter = this.coinParticles.createEmitter({
                x: this.centerX,
                y: -150,
                frame: 0,
                quantity: 3,
                frequency: 200,
                angle: { min: -30, max: 30 },
                speedX:  { min: -200, max: 200 },
                speedY: { min: -100, max: -200 },
                scale: { min: 0.4, max: 0.5},
                gravityY: 400,
                lifespan: { min: 10000, max: 15000 },
                particleClass: AnimatedParticle
            });
    /*
            const circle = new Phaser.Geom.Circle(0, -400, 500);
            this.coinsEmitter.setEmitZone({
                type: 'edge',
                source: circle,
                quantity: 50,
                stepRate: 0
            });
    */
        }

        spinUp() {
            this.spinbutton.setTexture('spinbutton'); // console.log('button up', arguments);
            this.spinWheel();
        }

        spinDown() {   
            if (this.canSpin) this.spinbutton.setTexture('spinbutton_hover'); // console.log('button down', arguments);
        }

        spinOver() {
            //  console.log('button over');
        }

        spinOut() {  
            this.spinbutton.setTexture('spinbutton'); // console.log('button out');
        }

        // adding a sprite by name with a given offset and origin (from wheel_config_.js file)
        addSprite(name)
        {
        var spriteData = this.getSpriteData(name);
        if(spriteData == null || spriteData.fileName === null) return null;
        return  this.add.sprite(this.centerX + spriteData.offsetX, this.centerY + spriteData.offsetY, name).setOrigin(spriteData.originX, spriteData.originY);
        } 

        addSpriteLocPos(name, posX, posY)
        {
            return  this.add.sprite(this.centerX + posX, this.centerY + posY, name);
        } 

        // return import data of the sprite from the wheel_config_.js file
        getSpriteData(spriteName)
        {
            for(var si = 0; si < wheelConfig.sprites.length; si++)
            {
                if(wheelConfig.sprites[si].name === spriteName) return wheelConfig.sprites[si];
            }
            return null;
        }

        lampsBlink(blink)
        {
            if(this.lampsArray)
            {
                if(blink && !this.lampsIntervalID )
                {
                    this._lampsOn = false;
                    this.lampsIntervalID = setInterval(()=>
                    {
                    this.lampsArray.forEach((l)=>{l.setOn(this._lampsOn);});
                    this._lampsOn = !this._lampsOn;
                    }, 1000);
                }
                else if(!blink && this.lampsIntervalID)
                {
                    clearInterval(this.lampsIntervalID);
                    this.lampsArray.forEach((l)=>{l.setOn(true);});
                    this.lampsIntervalID = null;
                }
            }    
        }

        showNextReel()
        {
            if(this.coinsEmitter!=null)
            {
                this.coinsEmitter.stop();
            }

            this.win_clip.stop();
            wheelConfig.cancelsectorWinAnim(this);
            console.log('reelNumber: ' + reelNumber);
            this.scene.start(this.fscenes[reelNumber]);
        }
    }

    function float_lerp(val1, val2, amount)
    {
        amount = amount < 0.0 ? 0.0 : amount;
        amount = amount > 1.0 ? 1.0 : amount;
        return val1 + (val2 - val1) * amount;
    };


    class Lamp
    {
        constructor (scene, offsetX, offsetY)
        {
            this.scene = scene;
            this.lamp = scene.addSpriteLocPos('lamp_off', offsetX, offsetY);  
        }

        on()
        {
            this.lamp.setTexture('lamp_on'); 
        }

        off()
        {
            this.lamp.setTexture('lamp_off'); 
        }

        setOn(lampOn)
        {
            this.lamp.setTexture(lampOn ? 'lamp_on' : 'lamp_off'); 
        }
    }

    class FortuneWheelAntique6 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelAntique6"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_6antique;
            console.log('set FortuneWheelAntique6');
        }
    }

    class FortuneWheelForest6 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelForest6"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_6forest;
            console.log('set FortuneWheelForest6');
        }
    }

    class FortuneWheelPirates6 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelPirates6"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_6pirates;
            console.log('set FortuneWheelPirates6');
        }
    }

    class FortuneWheelCandy8 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelCandy8"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_8candy;
            console.log('set FortuneWheelCandy8');
        }
    }

    class FortuneWheelGreek8 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelGreek8"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_8greek;
            console.log('set FortuneWheelGreek8');
        }
    }

    class FortuneWheelUnderwater8 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelUnderwater8"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_8underwater;
            console.log('set FortuneWheelUnderwater8');
        }
    }

    class FortuneWheelChina10 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelChina10"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_10china;
            console.log('set FortuneWheelChina10');
        }
    }

    class FortuneWheelIndian10 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelIndian10"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_10indian;
            console.log('set FortuneWheelIndian10');
        }
    }

    class FortuneWheelViking10 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelViking10"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_10viking;
            console.log('set FortuneWheelViking10');
        }
    }

    class FortuneWheelChristmas12 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelChristmas12"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_12christmas;
            console.log('set FortuneWheelChristmas12');
        }
    }

    class FortuneWheelModern12 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelModern12"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_12modern;
            console.log('set FortuneWheelModern12');
        }
    }

    class FortuneWheelEgypt14 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelEgypt14"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_14egypt;
            console.log('set FortuneWheelEgypt14');
        }
    }

    class FortuneWheelNeon14 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelNeon14"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_14neon;
            console.log('set FortuneWheelNeon14');
        }
    }

    class FortuneWheelFarm16 extends CommonWheel{
        // constructor
        constructor(){
            super("FortuneWheelFarm16"); // scene key FortuneWheel
        }
        setWheelConfig(){
            wheelConfig = wheel_config_16farm;
            console.log('set FortuneWheelFarm16');
        }
    }

class FortuneWheelPink16 extends CommonWheel{
    // constructor
    constructor(){
        super("FortuneWheelPink16"); // scene key FortuneWheel
    }
    setWheelConfig(){
        wheelConfig = wheel_config_16pink;
        console.log('set FortuneWheelPink16');
    }
}

// Add showPrizePopup as a method of CommonWheel
CommonWheel.prototype.showPrizePopup = function(imageKey) {
    if (this.prizePopup) {
        this.prizePopup.destroy(true);
    }

    // cria o sprite
    this.prizePopup = this.add.sprite(this.centerX, this.centerY, imageKey)
        .setOrigin(0.5)
        .setDepth(9999);

    // 🔹 Ajusta o tamanho máximo proporcional à tela
    let maxWidth = this.gameWidth * 0.4;   // 60% da largura da tela
    let maxHeight = this.gameHeight * 0.3; // 60% da altura da tela

    // calcula proporção
    let scaleX = maxWidth / this.prizePopup.width;
    let scaleY = maxHeight / this.prizePopup.height;
    let scale = Math.min(scaleX, scaleY);

    this.prizePopup.setScale(scale);

    // animação leve de pulsar
    this.tweens.add({
        targets: this.prizePopup,
        scale: scale * 1.05,     // só 5% maior
        ease: 'Sine.easeInOut',
        duration: 1000,
        yoyo: true,
        repeat: -1
    });
};

CommonWheel.prototype.showPrizePopup = function(imageKey) {
    if (this.prizePopup) {
        this.prizePopup.destroy(true);
    }

    // cria popup com scale 0 (invisível)
    this.prizePopup = this.add.sprite(this.centerX, this.centerY, imageKey)
        .setOrigin(0.5)
        .setDepth(9999)
        .setScale(0); // começa invisível

    // responsivo
    let maxWidth = this.gameWidth * 0.6;
    let maxHeight = this.gameHeight * 0.6;
    let scaleX = maxWidth / this.prizePopup.width;
    let scaleY = maxHeight / this.prizePopup.height;
    let finalScale = Math.min(scaleX, scaleY);

    // animação de entrada (impacto → pulo → volta gradual)
    this.tweens.add({
        targets: this.prizePopup,
        scale: finalScale * 1.0,  // 🔹 pulo forte, maior que o normal
        ease: 'Back.easeOut',
        duration: 600,
        yoyo: false,
        onComplete: () => {
            // volta gradativamente pro tamanho final
            this.tweens.add({
                targets: this.prizePopup,
                scale: finalScale,
                ease: 'Sine.easeOut',
                duration: 400,
                onComplete: () => {
                    // depois começa a pulsar suavemente
                    this.tweens.add({
                        targets: this.prizePopup,
                        scale: { from: finalScale, to: finalScale * 1.05 },
                        ease: 'Sine.easeInOut',
                        duration: 1200,
                        yoyo: true,
                        repeat: -1
                    });
                }
            });
        }
    });

    // 🔊 toca palmas em loop
    this.cheerSound = this.sound.add('fireworks_sound', { volume: 0.3, loop: true });
    this.cheerSound.play();

    // 🎉 chuva de moedas estilo confete
    let coins = this.add.particles('coinspin').setDepth(10000);
    let emitter = coins.createEmitter({
        x: { min: this.centerX - 200, max: this.centerX + 200 },
        y: -50,
        frame: 0,
        quantity: 4,
        frequency: 150,
        speedY: { min: 200, max: 400 },
        speedX: { min: -100, max: 100 },
        scale: { min: 0.25, max: 0.4 }, // 🔹 levemente menor pra não ficar exagerado
        gravityY: 300,
        lifespan: 4000,
        particleClass: AnimatedParticle
    });

    // 👉 clique no popup redireciona para contato.html
    this.prizePopup.setInteractive().on('pointerdown', () => {
        if (this.cheerSound) this.cheerSound.stop();
        coins.destroy();

        window.location.href = "contato.html";
    });
};

