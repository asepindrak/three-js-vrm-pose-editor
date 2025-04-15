// VRMViewer.jsx
import { useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

function VRMModel({ vrm, controls }) {
    const setBone = (name, rot) => {
        const bone = vrm?.humanoid?.getBoneNode(name)
        if (bone) {
            bone.rotation.x = rot.x
            bone.rotation.y = rot.y
            bone.rotation.z = rot.z
        }
    }

    useFrame(() => {
        if (!vrm) return

        Object.entries(controls).forEach(([name, rot]) => {
            setBone(name, rot)
        })
    })

    return vrm ? <primitive object={vrm.scene} /> : null
}

export default function VRMViewer() {
    const [vrm, setVrm] = useState(null)

    const controls = useControls('Pose Controls', {
        head: { x: 0, y: 0, z: 0 },
        spine: { x: 0, y: 0, z: 0 },
        jaw: { x: 0, y: 0, z: 0 },
        leftEye: { x: 0, y: 0, z: 0 },
        rightEye: { x: 0, y: 0, z: 0 },

        leftUpperArm: { x: 0, y: 0, z: 0 },
        leftLowerArm: { x: 0, y: 0, z: 0 },
        leftHand: { x: 0, y: 0, z: 0 },

        rightUpperArm: { x: 0, y: 0, z: 0 },
        rightLowerArm: { x: 0, y: 0, z: 0 },
        rightHand: { x: 0, y: 0, z: 0 },

        leftUpperLeg: { x: 0, y: 0, z: 0 },
        leftLowerLeg: { x: 0, y: 0, z: 0 },
        leftFoot: { x: 0, y: 0, z: 0 },

        rightUpperLeg: { x: 0, y: 0, z: 0 },
        rightLowerLeg: { x: 0, y: 0, z: 0 },
        rightFoot: { x: 0, y: 0, z: 0 },
    })



    useEffect(() => {
        const loader = new GLTFLoader()
        loader.register(parser => new VRMLoaderPlugin(parser))

        loader.load('/model.vrm', (gltf) => {
            const vrmData = gltf.userData.vrm
            vrmData.scene.rotation.y = Math.PI
            setVrm(vrmData)
        })
    }, [])

    const savePose = () => {
        const poseData = JSON.stringify(controls, null, 2)
        const blob = new Blob([poseData], { type: 'application/json' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'vrm-pose.json'
        link.click()
    }

    const loadPose = (event) => {
        const file = event.target.files[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (e) => {
            const pose = JSON.parse(e.target.result)
            Object.keys(pose).forEach(key => {
                if (key in controls) controls[key] = pose[key]
            })
        }
        reader.readAsText(file)
    }

    return (
        <>
            <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[1, 3, 2]} intensity={1} />
                <VRMModel vrm={vrm} controls={controls} />
                <OrbitControls />
            </Canvas>

            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <button onClick={savePose}>💾 Save Pose</button>
                <input type="file" accept=".json" onChange={loadPose} />
            </div>
        </>
    )
}
