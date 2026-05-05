import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Bounds, Center, OrbitControls, useGLTF } from '@react-three/drei'
import recyclingBinUrl from '../assets/recycling_bin.glb?url'

function BinMesh() {
  const { scene } = useGLTF(recyclingBinUrl)

  return (
    <Bounds clip fit margin={1.2} observe>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  )
}

function RecyclingBinModel() {
  return (
    <Canvas
      camera={{ fov: 38, position: [0, 1.2, 4] }}
      className="bin-canvas"
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.25} />
      <directionalLight intensity={2.1} position={[3, 5, 4]} />
      <directionalLight intensity={0.8} position={[-3, 2, -2]} />
      <Suspense fallback={null}>
        <BinMesh />
      </Suspense>
      <OrbitControls
        autoRotate
        autoRotateSpeed={1.2}
        enablePan={false}
        enableZoom={false}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  )
}

useGLTF.preload(recyclingBinUrl)

export default RecyclingBinModel
