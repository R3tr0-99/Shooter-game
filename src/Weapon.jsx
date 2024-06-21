import { WeaponModel } from "./WeaponModel";

export const Weapon = (props) => {
    return (
        <group {...props}>
            <WeaponModel />
        </group>
    );
}