/**
 * @react-three/fiber v8 registers its elements (<mesh>, <directionalLight>, ...) on the global
 * JSX namespace. With @types/react 19, JSX resolves through React.JSX instead, so the
 * registration is repeated there. Remove this file when moving to @react-three/fiber v9.
 */
import type { ThreeElements } from "@react-three/fiber";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
