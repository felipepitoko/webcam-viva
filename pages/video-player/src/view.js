export default class View{
    #btnInit = document.querySelector('#init')
    #statusElement = document.querySelector('#status')
    #videoFrameCanvas = document.createElement('canvas')
    #canvasContext = this.#videoFrameCanvas.getContext('2d',{willReadFrequently: true})
    #videoElement = document.querySelector('#video')
    getVideoFrame(video){
        const canvas = this.#videoFrameCanvas
        const [width,height] = [video.videoWidth, video.videoHeight]
        canvas.width = width
        canvas.height = height

        this.#canvasContext.drawImage(video, 0, 0, width, height)
        return this.#canvasContext.getImageData(0,0,width,height)
    }

    tooglePlayVideo(){
        if(this.#videoElement.paused){
            this.#videoElement.play()
            return
        }
        this.#videoElement.pause()
    }

    enableButton(){
        this.#btnInit.disabled = false
        this.#statusElement.innerHTML = 'Face model ready to go!'
    }

    configureOnBtnClick(fn){
        this.#btnInit.addEventListener('click',fn)
    }

    changeButtonText(text){
        this.#btnInit.innerHTML = text
    }
    
    log(text){
        this.#statusElement.innerHTML = text
    }

    setVideoSrc(url){
        this.#videoElement.src = url
    }
}