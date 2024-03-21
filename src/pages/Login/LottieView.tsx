import { useLottie } from 'lottie-react'
import groovyWalkAnimation from './lottiefile.json'


const LottieView = () => {
    const options = {
      animationData: groovyWalkAnimation,
      loop: true,
      autoplay: true,
    }
   
    const { View } = useLottie(options)
   
    return View
}
   
export default LottieView