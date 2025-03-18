import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./index.css";
import { flattenJSON } from "three/src/animation/AnimationUtils.js";
import { WallCreator } from "./classes/Wall";

interface Wall {
  id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  texture: string;
  normal: THREE.Vector3;
}

interface Floor {
  id: string;
  width: number;
  length: number;
  texture: string;
  rotation: number;
  y: number;
  z: number;
  x: number;
}

interface Texture {
  name: string;
  path: string;
  type: "wall" | "floor";
}

interface SelectedObject {
  id: string;
  type: "wall" | "floor";
  position: { x: number; y: number; z: number };
  texture: string;
}

const wallArray: Wall[] = [
  // Front wall
  {
    id: "wall-front",
    x: 0,
    y: 0,
    z: -10,
    rotation: 0,
    texture: "brickWall",
    normal: new THREE.Vector3(0, 0, 1),
  },
  // Back wall
  {
    id: "wall-back",
    x: 0,
    y: 0,
    z: 10,
    rotation: Math.PI,
    texture: "brickWall",
    normal: new THREE.Vector3(0, 0, -1),
  },
  // Left wall
  {
    id: "wall-left",
    x: -10,
    y: 0,
    z: 0,
    rotation: Math.PI / 2,
    texture: "brickWall",
    normal: new THREE.Vector3(1, 0, 0),
  },
  // Right wall
  {
    id: "wall-right",
    x: 10,
    y: 0,
    z: 0,
    rotation: -Math.PI / 2,
    texture: "brickWall",
    normal: new THREE.Vector3(-1, 0, 0),
  },
];

const floorArray: Floor[] = [
  {
    id: "floor-main",
    width: 20,
    length: 20,
    texture: "concreteFloor",
    rotation: -Math.PI / 2,
    y: -2.5,
    z: 0,
    x: 0,
  },
];

const BasicScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [scene, setScene] = useState(new THREE.Scene());
  const [walls, setWalls] = useState(wallArray);
  const [floors, setFloors] = useState(floorArray);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );

  useEffect(() => {
    if (!mountRef.current) return;

    // Clean up any existing scene to prevent duplicates
    if (
      rendererRef.current &&
      mountRef.current.contains(rendererRef.current.domElement)
    ) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
    console.log("WALLS", walls);
    // Scene setup

    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Camera setup - positioned top-down
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lock the polar angle to maintain top-down view
    controls.minPolarAngle = 0; // Minimum is straight down
    controls.maxPolarAngle = 0; // Maximum is also straight down (locks it)

    // Disable rotation around the vertical axis
    controls.enableRotate = false;

    // Enable panning and zooming
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    const wallTextures = new Map<string, THREE.Texture>();
    const floorTextures = new Map<string, THREE.Texture>();

    // Define textures
    const textures: Texture[] = [
      {
        name: "brickWall",
        path: "/textures/brick_wall.jpg",
        type: "wall",
      },
      {
        name: "concreteFloor",
        path: "/textures/concrete_floor.jpg",
        type: "floor",
      },
    ];

    // Load textures
    textures.forEach((texture) => {
      // Using placeholder texture for demo
      const textureObject = textureLoader.load(
        "https://threejs.org/examples/textures/uv_grid_opengl.jpg"
      );

      textureObject.wrapS = textureObject.wrapT = THREE.RepeatWrapping;

      if (texture.type === "wall") {
        textureObject.repeat.set(5, 2);
        wallTextures.set(texture.name, textureObject);
      } else if (texture.type === "floor") {
        textureObject.repeat.set(7, 7);
        floorTextures.set(texture.name, textureObject);
      }
    });

    // Create walls
    walls.forEach((wall) => {
      const newWall = new WallCreator({
        texture: wallTextures.get(wall.texture) as THREE.Texture,
        roughness: 0.7,
        metalness: 0.2,
        x: wall.x,
        y: wall.y,
        z: wall.z,
        rotation: wall.rotation,
        castShadow: true,
        receiveShadow: true,
        width: 20,
        height: 5,
        depth: 0.5,
        userData: { id: wall.id, type: "wall", texture: "brickWall" },
      });

      scene.add(newWall.getWallMesh());
    });

    // Create floor
    floors.forEach((floor) => {
      const floorGeometry = new THREE.PlaneGeometry(floor.width, floor.length);
      const texture = floorTextures.get(floor.texture);

      const floorMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
      });

      const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.rotation.x = floor.rotation;
      floorMesh.position.set(floor.x, floor.y, floor.z);
      floorMesh.receiveShadow = true;

      // Add custom properties for identification
      floorMesh.userData = {
        id: floor.id,
        type: "floor",
        texture: floor.texture,
      };

      scene.add(floorMesh);
    });

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create a raycaster for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Handle mouse click
    const handleMouseClick = (event: MouseEvent) => {
      if (event?.target?.id === "button") {
        console.log("event", event.target.id);
        return;
      }

      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update the picking ray with the camera and mouse position
      raycaster.setFromCamera(mouse, camera);

      // Calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        const intersectionPoint = intersects[0].point;
        const object = intersects[0].object;

        console.log("Click coordinates:", {
          x: intersectionPoint.x.toFixed(2),
          z: intersectionPoint.z.toFixed(2),
        });

        // You can also store these coordinates
        const clickCoordinates = {
          x: intersectionPoint.x,
          z: intersectionPoint.z,
        };

        // Continue with your existing object selection logic
        if (object.userData && object.userData.id) {
          console.log("OBJECT", object);
          setSelectedObject({
            id: object.userData.id,
            type: object.userData.type,
            position: {
              x: object.position.x,
              y: object.position.y,
              z: object.position.z,
            },
            clickPoint: clickCoordinates, // Add the exact click point to your selected object data
            texture: object.userData.texture,
          });
        }
      } else {
        // Even when clicking on empty space, try to get floor coordinates
        // by casting a ray at the floor's Y position
        const floorY = -2.5; // Your floor's Y position

        // Create a plane representing your floor
        const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);

        // Get intersection with the floor plane
        const rayDirection = new THREE.Vector3();
        camera.getWorldDirection(rayDirection);

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(floorPlane, intersection);

        if (intersection) {
          console.log("Click on floor at:", {
            x: intersection.x.toFixed(2),
            z: intersection.z.toFixed(2),
          });

          // You can store or use these coordinates even when no object is selected
          const clickCoordinates = {
            x: intersection.x,
            z: intersection.z,
          };

          const newWall = new WallCreator({
            texture: wallTextures.get("brickWall") as THREE.Texture,
            roughness: 0.7,
            metalness: 0.2,
            x: Number(intersection.x.toFixed(2)),
            y: 0,
            z: Number(intersection.z.toFixed(2)),
            rotation: -Math.PI / 2,
            castShadow: true,
            receiveShadow: true,
            width: 20,
            height: 5,
            depth: 0.5,
            userData: { id: "wall-new", type: "wall", texture: "brickWall" },
          });

          scene.add(newWall.getWallMesh());

          console.log("CLICK CO ORDS", clickCoordinates);

          // Maybe set some state to track the floor click position
          // setFloorClickPosition(clickCoordinates);
        }

        // Clear selection if clicked on empty space
        setSelectedObject(null);
      }
    };

    // Add event listener for mouse clicks
    window.addEventListener("click", handleMouseClick);

    // Animation loop
    const animationId = { current: 0 };
    const animate = () => {
      animationId.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleMouseClick);
      cancelAnimationFrame(animationId.current);

      // Clean up three.js resources
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }

      // Dispose of geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();

          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
      <button
        id="button"
        onClick={() => {}}
        className="absolute top-10 left-10 text-black border border-white rounded p-2 cursor-pointer bg-white"
      >
        hello
      </button>
      {/* Object info panel */}
      {selectedObject && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white p-4 m-4 rounded">
          <h3 className="text-xl font-bold mb-2">Selected Object</h3>
          <p>
            <strong>ID:</strong> {selectedObject.id}
          </p>
          <p>
            <strong>Type:</strong> {selectedObject.type}
          </p>
          <p>
            <strong>Position:</strong> x: {selectedObject.position.x.toFixed(2)}
            , y: {selectedObject.position.y.toFixed(2)}, z:{" "}
            {selectedObject.position.z.toFixed(2)}
          </p>
          <p>
            <strong>Texture:</strong> {selectedObject.texture}
          </p>
        </div>
      )}
    </div>
  );
};

export default BasicScene;
