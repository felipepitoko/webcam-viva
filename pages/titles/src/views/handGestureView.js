export default class HandGestureView{
    #handsCanvas = document.querySelector('#hands')
    #canvasContext = this.#handsCanvas.getContext('2d')
    #fingerLookupIndexes
    #styler

    constructor({fingerLookupIndexes, styler}){
        this.#handsCanvas.width = globalThis.screen.availWidth
        this.#handsCanvas.height = globalThis.screen.availHeight
        this.#fingerLookupIndexes = fingerLookupIndexes
        this.#styler = styler
        setTimeout(()=> styler.loadDocumentStyles(),200)
      }

    clear(){
        this.#canvasContext.clearRect(0,0, this.#handsCanvas.width, this.#handsCanvas.height)
    }

    clickOnElement(x,y){
        const element = document.elementFromPoint(x,y)
        if(!element) return
        // console.log('Voce clicou:',{element,x,y})
        const rect = element.getBoundingClientRect()
        const event = new MouseEvent('click',{
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + x,
            clientY: rect.top + y
        })

        element.dispatchEvent(event)
    }

    drawResults(hands){
        for(const { keypoints, handedness } of hands){
            // console.log(handedness)
            if(!keypoints) continue
            this.#canvasContext.fillStyle = handedness === 'Left'? 'rgb(44,212,103)' : 'rgb(44,212,103)'
            this.#canvasContext.strokeStyle = "white"
            this.#canvasContext.lineWidth = 8
            this.#canvasContext.lineJoin = "round"

            //desenhar juntas
            this.#drawJoients(keypoints)
            //desenhar dedos
            this.#drawFingerAndHoverElements(keypoints)
        }
        // console.log('Log da view',hands)
    }

    #drawJoients(keypoints){
        for (const {x,y} of keypoints){
            this.#canvasContext.beginPath()
            const [newX, newY, radius, startAngle,endAngle] = [x-2,y-2, 3, 0, 2 *Math.PI]

            this.#canvasContext.arc(newX,newY,radius,startAngle,endAngle)
            this.#canvasContext.fill()
        }
    }

    #drawFingerAndHoverElements(keypoints){
        //array com os nomes dos dedos
        const fingers = Object.keys(this.#fingerLookupIndexes)

        for (const finger of fingers){
            //em que lugar da tela está esse dedo? x,y
            const points = this.#fingerLookupIndexes[finger].map(
                index => keypoints[index]
            )

            const region = new Path2D()
            const [{x,y}] = points
            region.moveTo(x,y)
            for (const point of points){
                region.lineTo(point.x, point.y)
            }
            this.#canvasContext.stroke(region)
            this.#hoverElement(finger, points)
        }
    }

    #hoverElement(finger, points) {
        if(finger !== "indexFinger") return
        const tip = points.find(item => item.name === "index_finger_tip")
        const element = document.elementFromPoint(tip.x, tip.y)
        if(!element) return;
        const fn = () => this.#styler.toggleStyle(element, ':hover')
        fn()
        
        setTimeout(() => fn(), 500);
    }

    loop(fn){
        requestAnimationFrame(fn)
    }

    scrollPage(top){
        // console.log('Eu deveria baixar', top)
        scroll({
            top,
            behavior: "smooth"
        })
    }
}