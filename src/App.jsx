import * as TWEEN from "@tweenjs/tween.js";
import { PointerLockControls,Sky } from "@react-three/drei";
import { Ground } from "./Ground.jsx" 
import { Physics } from "@react-three/rapier";
import { Player } from "./Player.jsx";
import { Cubes } from "./Cube.jsx";
import { useFrame } from "@react-three/fiber";
import { create } from "zustand";

const shadowOffset= 50;

export const usePointerLockControlsStore = create ( () => ({
  isLock: false,
}));

export const App = () => {

  useFrame(() => {
    TWEEN.update();
  });

  const PointerLockControlsLockHandler = () => {
    usePointerLockControlsStore.setState({ isLock: true });
  }

  const PointerLockControlsUnlockHandler = () => {
    usePointerLockControlsStore.setState({ isLock: false});
  }

  return (
    <>
     {/*lock mouse, sun, illumination and shadows */}
     <PointerLockControls onLock={PointerLockControlsLockHandler} onUnlock={PointerLockControlsUnlockHandler} />
     <Sky sunPosition={[100, 20, 100]} />
     <ambientLight intensity={1.5} />
     <directionalLight 
       castShadow 
       intensity={1.5} 
       shadow-mapSize={4096}
       shadow-camera-top= {shadowOffset}
       shadow-camera-bottom= {-shadowOffset}
       shadow-camera-left={shadowOffset}
       shadow-camera-right={-shadowOffset} 
       position={[100, 100, 0]} 
     />

     {/* gravity effects and cube */}
     <Physics gravity={[0, -20, 0]}>
        <Ground />
        <Player />
        <Cubes />
     </Physics>
    </>
  )
}

export default App;
