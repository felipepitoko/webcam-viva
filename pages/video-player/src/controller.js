export default class Controller{
    #view
    #worker
    #camera
    #blinkCounter = 0
    #faceDetectionOn = false
    #blinkFrames = 0
    constructor({view, worker, camera, videoUrl}){
        this.#view = view
        this.#camera = camera
        this.#view.configureOnBtnClick(this.onBtnStart.bind(this))
        this.#worker = this.#configureWorker(worker)
        this.#view.setVideoSrc(videoUrl)
    }

    #configureWorker(worker) {
        let ready = false
        worker.onmessage = ({data}) =>{
            // console.log('recebi no controller',data)
            if(data === 'READY'){
                this.#view.enableButton()
                ready = true
                return
            }
            const blinked = data.blinked            
            // console.log('blinked',blinked, 'frames',this.#blinkFrames) 
            if(blinked) this.#blinkFrames +=1
            if(this.#blinkFrames >=1){
                this.#blinkCounter += blinked
                this.#view.tooglePlayVideo()
                this.log()
                this.#blinkFrames = 0
            }
        }

        return {
            send (msg) {
                if(!ready) return
                worker.postMessage(msg)
            }
        }
    }

    static async initialize(deps){
        const controller = new Controller(deps)
        controller.log('not yet detecting eyes')
        return controller.init()
    }

    async init(){
        console.log('Estou funcioando')
    }

    loop(){        
        if(this.#faceDetectionOn){
            const video = this.#camera.video
            const img = this.#view.getVideoFrame(video)
            this.#worker.send(img)
            this.log('detecting eye blink')
    
            setTimeout(()=> this.loop(), 100)
        }        
    }

    log(text){
        const times = `         - blinked times: ${this.#blinkCounter}`
        this.#view.log(`status:${text}`.concat(this.#blinkCounter? times :""))
    }

    onBtnStart(){
        if(this.#faceDetectionOn){            
            this.#faceDetectionOn = false
            this.#view.changeButtonText('Iniciar reconhecimento')
            this.#blinkCounter = 0
            this.log('parado')
            return
        }

        this.log('Initializing face detection...')
        this.#blinkCounter = 0
        this.#faceDetectionOn = true
        this.loop()
        this.#view.changeButtonText('Parar reconhecimento')
    }
}