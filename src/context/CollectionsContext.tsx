import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Movie {
  id: string;
  title: string;
  poster: string;
}

export interface Collection {
  id: string;
  name: string;
  isPrivate: boolean;
  movies: Movie[];
  createdBy: string;
  likes: number;
  createdAt: Date;
}

interface CollectionsContextType {
  collections: Collection[];
  userCollections: Collection[];
  addCollection: (collection: Omit<Collection, "id" | "likes" | "createdAt">) => void;
  likeCollection: (id: string) => void;
  saveCollection: (id: string) => void;
  savedCollections: string[];
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const currentUser = "currentUser"; // Simula el usuario actual

  // Colecciones públicas (mock data inicial)
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "All time favorites",
      isPrivate: false,
      createdBy: "@Ann0",
      likes: 80,
      createdAt: new Date(),
      movies: [
        {
          id: "1",
          title: "Alice in Wonderland",
          poster: "https://m.media-amazon.com/images/I/71niXI3lxlL._AC_UF894,1000_QL80_.jpg"
        },
        {
          id: "2",
          title: "La La Land",
          poster: "https://i.pinimg.com/736x/7c/4a/23/7c4a23a434ef5ff58e9c51e29e4fe909.jpg"
        },
        {
          id: "3",
          title: "Interstellar",
          poster: "https://i.pinimg.com/1200x/4c/29/d6/4c29d6753e61511d6369567214af2f53.jpg"
        }
      ]
    }
  ]);

  // Colecciones guardadas por el usuario
  const [savedCollections, setSavedCollections] = useState<string[]>([]);

  // Agregar nueva colección
  const addCollection = (newCollection: Omit<Collection, "id" | "likes" | "createdAt">) => {
    const collection: Collection = {
      ...newCollection,
      id: Date.now().toString(),
      likes: 0,
      createdAt: new Date(),
    };

    // Solo agregar a la lista pública si NO es privada
    if (!collection.isPrivate) {
      setCollections(prev => [collection, ...prev]);
    } else {
      // Si es privada, solo el usuario la verá
      setCollections(prev => [collection, ...prev]);
    }
  };

  // Like a una colección
  const likeCollection = (id: string) => {
    setCollections(prev =>
      prev.map(c => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  // Guardar colección
  const saveCollection = (id: string) => {
    setSavedCollections(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  // Filtrar colecciones del usuario actual
  const userCollections = collections.filter(c => c.createdBy === currentUser);

  // Filtrar colecciones públicas (excluir las privadas de otros usuarios)
  const publicCollections = collections.filter(
    c => !c.isPrivate || c.createdBy === currentUser
  );

  return (
    <CollectionsContext.Provider
      value={{
        collections: publicCollections,
        userCollections,
        addCollection,
        likeCollection,
        saveCollection,
        savedCollections,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error("useCollections must be used within CollectionsProvider");
  }
  return context;
}