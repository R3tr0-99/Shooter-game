import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { WeaponModel } from "./WeaponModel";
import { useEffect, useRef, useState } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { usePointerLockControlsStore } from "./App";
import { create } from "zustand";
import SingleShootAK15 from "./assets/sounds/single-shoot-ak15.wav";
import FlashShoot from "./assets/images/flash_shoot.png";

const SHOOT_BUTTON= parseInt(import.meta.env.VITE_SHOOT_BUTTON);
const AIM_BUTTON= parseInt(import.meta.env.VITE_AIM_BUTTON);

const recoilAmount= 0.03;
const recoilDuration= 50;
const easing= TWEEN.Easing.Quadratic.Out;

export const useAimingStore = create((set) => ({
    isAiming: null,
    setIsAiming: (value) => set(() => ({ isAiming: value }))
}));

export const Weapon = (props) => {

    const [recoilAnimation, setRecoilAnimation]= useState(null);
    const [isRecoilAnimationFinished, setIsRecoilAnimationFinished]= useState(true);
    const [isShooting, setIsShooting]= useState(false);
    const setIsAiming= useAimingStore((state) => state.setIsAiming);
    const weaponRef= useRef();

    const audio= new Audio(SingleShootAK15);

    const texture = useLoader(THREE.TextureLoader, FlashShoot, (loader) =>{
        console.log("Texture Loaded ok", loader);
    });

    const [flashAnimation, setFlashAnimation] = useState(null);

    useEffect( ()=> {
        document.addEventListener('mousedown', (ev)=> {
            ev.preventDefault();
            mouseButtonHandler(ev.button, true);
        });

        document.addEventListener('mouseup', (ev) => {
            ev.preventDefault();
            mouseButtonHandler(ev.button, false);
        });
    }, []);

    const mouseButtonHandler= (button, state) => {
        if (!usePointerLockControlsStore.getState().isLock) return;

        switch(button) {
            case SHOOT_BUTTON:
                setIsShooting(state);
                break;
            case AIM_BUTTON:
                setIsAiming(state);
                break
        }
    }

    const generateRecoilOffset = () => {
        return new THREE.Vector3(Math.random() * recoilAmount, Math.random() * recoilAmount, Math.random() * recoilAmount)
    }

    const generateNewPositionOfRecoil= (currentPosition= new THREE.Vector3(0, 0, 0)) => {
        const recoilOffset= generateRecoilOffset();
        return currentPosition.clone().add(recoilOffset);
    }

    const initRecoilAnimation = () => {
        const currentPosition= new THREE.Vector3(0, 0, 0);
        const newPosition= generateNewPositionOfRecoil(currentPosition);

        const twRecoilAnimation= new TWEEN.Tween(currentPosition)
          .to(newPosition, recoilDuration)
          .easing(easing)
          .repeat(1)
          .yoyo(true)
          .onUpdate( ()=> {
              weaponRef.current.position.copy(currentPosition);
            })
          .onStart(() => {
            setIsRecoilAnimationFinished(false);
          })
          .onComplete(() => {
            setIsRecoilAnimationFinished(true);
          })

        setRecoilAnimation(twRecoilAnimation);
        

    /*const initRecoilAnimation = () => {
    const currentPosition = new THREE.Vector3(0, 0, 0);
    const newPosition = generateNewPositionOfRecoil(currentPosition);
    const recoilDuration = 50; 
    const easing = t => t * (2 - t);

    const weapon = weaponRef.current;

    const animateRecoil = (startTime) => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / recoilDuration, 1);

        currentPosition.x = currentPosition.x + (newPosition.x - currentPosition.x) * easing(progress);
        currentPosition.y = currentPosition.y + (newPosition.y - currentPosition.y) * easing(progress);
        currentPosition.z = currentPosition.z + (newPosition.z - currentPosition.z) * easing(progress);

        weapon.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        if (progress < 1) {
            requestAnimationFrame(() => animateRecoil(startTime));
        } else {
            requestAnimationFrame(() => animateBack(currentTime));
        }
    };

    const animateBack = (startTime) => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / recoilDuration, 1);

        currentPosition.x = newPosition.x - (newPosition.x - 0) * easing(progress);
        currentPosition.y = newPosition.y - (newPosition.y - 0) * easing(progress);
        currentPosition.z = newPosition.z - (newPosition.z - 0) * easing(progress);

        weapon.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        if (progress < 1) {
            requestAnimationFrame(() => animateBack(startTime));
        } else {
            setIsRecoilAnimationFinished(true);
        }
    };

    const startAnimation = () => {
        setIsRecoilAnimationFinished(false);
        requestAnimationFrame(() => animateRecoil(performance.now()));
    };

    setRecoilAnimation(startAnimation);

    startAnimation();
};

const generateNewPositionOfRecoil = (currentPosition) => {
    return new THREE.Vector3(currentPosition.x - 0.1, currentPosition.y + 0.05, currentPosition.z);
};

const weaponRef = { current: new THREE.Object3D() };

const setIsRecoilAnimationFinished = (isFinished) => {
    console.log("Recoil Animation Finished:", isFinished);
};

const setRecoilAnimation = (animation) => {
    console.log("Recoil Animation Set");
};

initRecoilAnimation();
*/
    }

    const startShooting = () => {
        if (!recoilAnimation) return;
        //console.log("Start shooting ok");
        audio.play();

        recoilAnimation.start();
        flashAnimation.start();
    }

    useEffect( () => {
        initRecoilAnimation();
    }, []);

    useEffect(() =>{
        if(isShooting) {
            startShooting();
        }
    }, [isShooting]);

    useFrame( () => {
        if (isShooting && isRecoilAnimationFinished) {
            startShooting();
        }
    });

    const [flashOpacity, setFlashOpacity] = useState(1);

    const initFlashAnimation = () => {
        const currentFlashParams = { opacity: 0 };

        const twFlashAnimation = new TWEEN.Tween(currentFlashParams)
          .to({ opacity: 1 }, recoilDuration)
          .easing(easing)
          .onUpdate( () => {
            //console.log("Current Opacity: ", currentFlashParams.opacity);
            setFlashOpacity(currentFlashParams.opacity);
          })
          .onComplete( () => {
            setFlashOpacity( () => 0);
          });
          
        setFlashAnimation(twFlashAnimation);
    /* const initFlashAnimation = () => {
    const currentFlashParams = { opacity: 0 };
    const finalFlashParams = { opacity: 1 };
    const recoilDuration = 50
    const easing = t => t * (2 - t);

    const startTime = performance.now();
    
    const setFlashOpacity = (opacity) => {
        const flashElement = document.getElementById('flash-element');
        if (flashElement) {
            flashElement.style.opacity = opacity.toString();
        } else {
            console.error('Element "flash-element" not found');
        }
    };

    const animateFlash = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / recoilDuration, 1);
        const easedProgress = easing(progress);

        currentFlashParams.opacity = (finalFlashParams.opacity - 0) * easedProgress + 0;

        setFlashOpacity(currentFlashParams.opacity);

        if (progress < 1) {
            requestAnimationFrame(animateFlash);
        } else {
            setFlashOpacity(0);
        }
    };

    requestAnimationFrame(animateFlash);
    
    //More controls
    const setFlashAnimation = (animation) => {
        console.log("Flash Animation Set");
    };

    setFlashAnimation(animateFlash);
};

initFlashAnimation();
 */
    }

    useEffect( () => {
        initFlashAnimation();
    }, []);

    return ( 
        <group {...props}>
            <group ref={weaponRef}>
                <mesh position={[0, 0.5, 7]} scale={[2, 2, 0]} rotation-y={-Math.PI}>
                    <planeGeometry attach="geometry" args={[2, 2]} />
                    <meshBasicMaterial attach="material" map={texture} transparent opacity={flashOpacity} />
                </mesh>
                <WeaponModel />
            </group>
        </group>
    );
}