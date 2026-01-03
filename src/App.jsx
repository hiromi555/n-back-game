import { Canvas } from '@react-three/fiber'
import { Environment} from '@react-three/drei'
import { NBackGame } from './NBackGame.jsx';

function App() {
  return (
    <>
    <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        style={{ background: '#000' }}
        >
        <Environment preset="studio" />
        <NBackGame />
        </Canvas>
    </>
  )
}

export default App
