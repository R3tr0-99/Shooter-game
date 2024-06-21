import { PointerLockControls,Sky } from "@react-three/drei";
import { Ground } from "./Ground.jsx" 
import { Physics } from "@react-three/rapier";
import { Player } from "./Player.jsx";
import { Cubes } from "./Cube.jsx";
import { WeaponModel } from "./WeaponModel.jsx";

export const App = () => {
  return (
    <>
     {/*lock mouse, sun, illumination and shadows */}
     <PointerLockControls />
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

     {/* assault rifle */}
     <group position={[3, 1, -2]}>
        <WeaponModel />
     </group>
    </>
  )
}

export default App
