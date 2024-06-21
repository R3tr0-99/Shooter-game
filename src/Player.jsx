import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as TWEEN from "@tweenjs/tween.js";
import { CapsuleCollider, RigidBody, useRapier } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { usePersonControls } from "./hook";
import { useFrame } from "@react-three/fiber";
import { Weapon } from "./Weapon";

const MOVE_SPEED = 5;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();
const rotation = new THREE.Vector3();

export const Player = () => {
    const playerRef = useRef();
    const { forward, backward, left, right, jump } = usePersonControls();
    const objectInHandRef = useRef();

    const swayingObjectRef = useRef();
    const [swayingAnimation, setSwayingAnimation]= useState(null);
    const [swayingBackAnimation, setSwayingBackAnimation]= useState(null);
    const [isSwayingAnimationFinished, setIsSwayingAnimationFinished]= useState(true);

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

    const initSwayingObjectAnimation = () => {
        const currentPosition = new THREE.Vector3(0, 0, 0);
        const initialPosition = new THREE.Vector3(0, 0, 0);
        const newPosition = new THREE.Vector3(-0.05, 0, 0);
        const animationDuration = 300;
        const easing= TWEEN.Easing.Quadratic.Out;

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
    }

    useEffect( () => {
        initSwayingObjectAnimation();
    }, []);

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
