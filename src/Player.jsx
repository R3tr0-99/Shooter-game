import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as TWEEN from "@tweenjs/tween.js";
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { usePersonControls } from "./hook";
import { useFrame } from "@react-three/fiber";
import { useAimingStore, Weapon } from "./Weapon";

const MOVE_SPEED = 5;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();
const easing = TWEEN.Easing.Quadratic.Out;

export const Player = () => {
    const playerRef = useRef();
    const { forward, backward, left, right, jump } = usePersonControls();
    const objectInHandRef = useRef();

    const swayingObjectRef = useRef();
    const [swayingAnimation, setSwayingAnimation]= useState(null);
    const [swayingBackAnimation, setSwayingBackAnimation]= useState(null);
    const [isSwayingAnimationFinished, setIsSwayingAnimationFinished]= useState(true);

    const [swayingNewPosition, setSwayingNewPosition]= useState(new THREE.Vector3(-0.005, 0.005, 0));
    const [swayingDuration, setSwayingDuration]= useState(1000);
    const [isMoving, setIsMoving]= useState(false);
    const isAiming= useAimingStore((state) => state.isAiming);

    const rapier = useRapier();

    useFrame(( state ) => {
        if(!playerRef.current) return;

        //Moving player
        const velocity = playerRef.current.linvel();

        frontVector.set(0, 0, backward - forward);
        sideVector.set(left - right, 0, 0);
        direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED).applyEuler(state.camera.rotation);

        playerRef.current.wakeUp();
        playerRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z });

        //Jump
        const world= rapier.world;
        const ray= world.castRay(new RAPIER.Ray(playerRef.current.translation(), { x: 0, y: -1, z: 0 }));
        const grounded= ray && ray.collider && Math.abs(ray.timeOfImpact) <= 1.5;

        if (jump && grounded) doJump();

        //console.log("Player velocity: ", playerRef.current.linvel());
        //console.log("Jump: ", jump);
        //console.log("Grounded: ", grounded);

        //Moving the camera
        const {x, y, z} = playerRef.current.translation();
        state.camera.position.set(x, y, z);

        //Move the object in hand's player
        objectInHandRef.current.rotation.copy(state.camera.rotation);
        objectInHandRef.current.position.copy(state.camera.position).add(state.camera.getWorldDirection(rotation));

        const isMoving = direction.length() > 0;

        if (isMoving && isSwayingAnimationFinished){
            setIsSwayingAnimationFinished(false);
            swayingAnimation.start();
        }

    });

    const doJump = () => {
        playerRef.current.setLinvel({ x: 0, y: 8, z: 0});
    }

    const setSwayingAnimationParams= () => {
        if(!swayingAnimation) return;

        swayingAnimation.stop();
        setIsSwayingAnimationFinished(true);

        if(isMoving) {
            setSwayingDuration(() => 300);
            setSwayingNewPosition(() => new THREE.Vector3(-0.05, 0, 0));
        }
        else { 
            setSwayingDuration(() => 1000);
            setSwayingNewPosition(() => new THREE.Vector3(-0.01, 0, 0));
        }
    }

    const initSwayingObjectAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = swayingNewPosition;
        const animationDuration = swayingDuration;

        const twSwayingAnimation = new TWEEN.Tween(currentPosition)
          .to(newPosition, animationDuration)
          .easing(easing)
          .onUpdate( () => {
              swayingObjectRef.current.position.copy(currentPosition);
            });

        const twSwayingBackAnimation = new TWEEN.Tween(currentPosition)
          .to(initialPosition, animationDuration)
          .easing(easing)
          .onUpdate( () => {
              swayingObjectRef.current.position.copy(currentPosition);
            })
          .onComplete( () => {
              setIsSwayingAnimationFinished(true);
            })

        twSwayingAnimation.chain(twSwayingBackAnimation);

        setSwayingAnimation(twSwayingAnimation);
        setSwayingBackAnimation(twSwayingBackAnimation);

    /* const initSwayingObjectAnimation = () => {
    const currentPosition = { x: 0, y: 0, z: 0 };
    const initialPosition = { x: 0, y: 0, z: 0 };
    const newPosition = swayingNewPosition;
    const animationDuration = swayingDuration;
    const easing = (t) => t * (2 - t);

    const swayingObject = swayingObjectRef.current;
    let startTime = null;

    const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        currentPosition.x = initialPosition.x + (newPosition.x - initialPosition.x) * easing(progress);
        currentPosition.y = initialPosition.y + (newPosition.y - initialPosition.y) * easing(progress);
        currentPosition.z = initialPosition.z + (newPosition.z - initialPosition.z) * easing(progress);

        swayingObject.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            startBackAnimation();
        }
    };

    const startBackAnimation = () => {
        startTime = null;
        const animateBack = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);

            currentPosition.x = newPosition.x - (newPosition.x - initialPosition.x) * easing(progress);
            currentPosition.y = newPosition.y - (newPosition.y - initialPosition.y) * easing(progress);
            currentPosition.z = newPosition.z - (newPosition.z - initialPosition.z) * easing(progress);

            swayingObject.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

            if (progress < 1) {
                requestAnimationFrame(animateBack);
            } else {
                setIsSwayingAnimationFinished(true);
            }
        };
        requestAnimationFrame(animateBack);
    };

    requestAnimationFrame(animate);
};

const swayingObjectRef = { current: new THREE.Object3D() };
const swayingNewPosition = new THREE.Vector3(1, 0, 0);
const swayingDuration = 2000;

const setIsSwayingAnimationFinished = (isFinished) => {
    //console.log("Animation finished:", isFinished);
};

initSwayingObjectAnimation();
*/
    }

    useEffect( () => {
        setSwayingAnimationParams();
    }, [isMoving]);

    useEffect( () => {
        initSwayingObjectAnimation();
    }, [swayingNewPosition, swayingDuration]);

    const [aimingAnimation, setAimingAnimation]= useState(null);
    const [aimingBackAnimation, setAimingBackAnimation]= useState(null);

    const initAimingAnimation = () => {
        const currentPosition = swayingObjectRef.current.position;
        const finalPosition = new THREE.Vector3(-0.3, -0.01, 0);

        const twAimingAnimation = new TWEEN.Tween(currentPosition)
          .to(finalPosition, 200)
          .easing(easing);

        const twAimingBackAnimation = new TWEEN.Tween(finalPosition.clone())
          .to(new THREE.Vector3(0, 0, 0), 200)
          .easing(easing)
          .onUpdate((position) => {
              swayingObjectRef.current.position.copy(position);
            });
       
        setAimingAnimation(twAimingAnimation);
        setAimingBackAnimation(twAimingBackAnimation);
        
    /* const initAimingAnimation = () => {
    const swayingObject = swayingObjectRef.current;
    const finalPosition = new THREE.Vector3(-0.3, -0.01, 0);
    const initialPosition = new THREE.Vector3(0, 0, 0);
    const animationDuration = swayingDuration;
    const easing = (t) => t * (2 - t);

    const animateToFinal = (startTime) => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        swayingObject.position.x = initialPosition.x + (finalPosition.x - initialPosition.x) * easing(progress);
        swayingObject.position.y = initialPosition.y + (finalPosition.y - initialPosition.y) * easing(progress);
        swayingObject.position.z = initialPosition.z + (finalPosition.z - initialPosition.z) * easing(progress);

        if (progress < 1) {
            requestAnimationFrame(() => animateToFinal(startTime));
        } else {
            requestAnimationFrame(() => animateBack(currentTime));
        }
    };

    const animateBack = (startTime) => {
        const currentTime = performance.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        swayingObject.position.x = finalPosition.x - (finalPosition.x - initialPosition.x) * easing(progress);
        swayingObject.position.y = finalPosition.y - (finalPosition.y - initialPosition.y) * easing(progress);
        swayingObject.position.z = finalPosition.z - (finalPosition.z - initialPosition.z) * easing(progress);

        if (progress < 1) {
            requestAnimationFrame(() => animateBack(startTime));
        }
    };

    requestAnimationFrame(() => animateToFinal(performance.now()));
};

const swayingObjectRef = { current: new THREE.Object3D() };

initAimingAnimation();
*/
    }

    useEffect(() => {
        initAimingAnimation();
    }, [swayingObjectRef]);

    useEffect(() => {
        if (isAiming) {
            swayingAnimation.stop();
            aimingAnimation.start();
        }
        else if (isAiming === false) {
            aimingBackAnimation?.start()
              .onComplete(() => {
                setSwayingAnimationParams();
            });

        }
    }, [isAiming, aimingAnimation, aimingBackAnimation]);

    return (
        <>
          <RigidBody colliders={false} mass={1} ref={playerRef} lockRotations>
            <mesh castShadow>
                <capsuleGeometry args={[0.5, 0.5]} />
                <CapsuleCollider args={[0.75, 0.5]} />
            </mesh>
          </RigidBody>
          <group ref={objectInHandRef}>
             <group ref={swayingObjectRef}>
                <Weapon position={[0.3, -0.1, 0.3]} scale={0.1} rotation-y={ Math.PI } />
             </group>
         </group>
        </>
    );
}
