import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import floorTexture from "./assets/floor3.png";

export const Ground = () => {
    const texture= useTexture(floorTexture);
    texture.wrapS= texture.WrapT= THREE.RepeatWrapping;
    
    return (
        <mesh position={[0, -5, 0]} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[500, 500]} />
            <meshStandardMaterial color="grey" map={texture} map-repeat={[100, 100]} />
        </mesh>
    );
}