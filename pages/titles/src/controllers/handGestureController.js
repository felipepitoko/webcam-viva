import { prepareRunChecker } from "../../../../libs/shared/util.js"

const { shouldRun : scrollShouldRun } = prepareRunChecker({timerDelay: 400})
const { shouldRun : clickShouldRun } = prepareRunChecker({timerDelay: 400})
export default class HandGestureController{
    #view
    #service
    #camera
    #lastDirection = {
        direction: '',
        y:0
    }

    constructor({camera, view, service}){
        this.#camera = camera
        this.#view = view
        this.#service = service
    }

    async init(){
        return this.loop()
    }

    async loop(){
        await this.#service.initializeDetector()
        await this.estimateHands()
        this.#view.loop(this.loop.bind(this))
    }

    #scrollPage(direction){
        const pixelsPerScroll = 200
        if(this.#lastDirection.direction === direction){
            this.#lastDirection.y = direction === 'scroll-down'? this.#lastDirection.y + pixelsPerScroll : this.#lastDirection.y - pixelsPerScroll 
        }
        else {
            this.#lastDirection.direction = direction
        }

        this.#view.scrollPage(this.#lastDirection.y)
    }

    async estimateHands(){
        try {
            const hands = await this.#service.estimateHands(this.#camera.video)           
            this.#view.clear()
            if(hands && hands.length) this.#view.drawResults(hands)
            // const gesture = await this.#service.detectGestures(hands)
            for await (const {event, x, y} of this.#service.detectGestures(hands)){
                // console.log('Achei agora',event, x, y)
                if(event === 'click'){
                    if(!clickShouldRun()) continue
                    this.#view.clickOnElement(x,y)
                    continue
                }
                
                if(event.includes('scroll')){
                    if(!scrollShouldRun()) continue
                    this.#scrollPage(event)
                }
                
            }
            // for await (){

            // }
            // console.log({hands})  
        } catch (error) {
            console.error('Não funcionou estimar mãos')
            console.log(error)
        }        
    }

    static async initialize(deps){
        const controller = new HandGestureController(deps)
        return controller.init()
    }
}