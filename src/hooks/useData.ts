
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase.config";
import { collection, query, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { mockUsers } from "@/mocks/users";
import { mockChats } from "@/mocks/chats";
import { mockMessages } from "@/mocks/messages";
import { mockEvents } from "@/mocks/events";
import { Chat } from "@/types/chat";

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  [key: string]: any;
};

export type Message = {
  id: string;
  chatId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  attachments?: Array<{
    id: string;
    type: 'image' | 'video' | 'file';
    url: string;
    thumbnail?: string;
  }>;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  date: any;
  location: string;
  organizerId?: string;
  participants?: string[];
  image?: string;
  [key: string]: any;
};

export type DataItem = User | Chat | Message | Event;

type CollectionName = "users" | "chats" | "messages" | "events";

function useData<T extends DataItem>(collectionName: CollectionName, realTime: boolean = true): { 
  data: T[],
  loading: boolean 
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const firstFetch = useRef(true);

  useEffect(() => {
    firstFetch.current = true;
  }, [collectionName]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user && realTime) {
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];

          onSnapshot(q, (snapshot) => {
            if (!firstFetch.current) {
              console.log("real time"); 
            }
            firstFetch.current = false;
            const newData = snapshot.docs.map((doc) => ({ 
              id: doc.id, 
              ...doc.data() 
            })) as T[];
            setData(newData);
          });
          setData(fetchedData);
        } else if (user){
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(fetchedData);
        } else {
          // Use mock data if user is not logged in
          switch (collectionName) {
            case "users":
              setData(mockUsers as unknown as T[]);
              break;
            case "chats":
              setData(mockChats as unknown as T[]);
              break;
            case "messages":
              setData(mockMessages as unknown as T[]);
              break;
            case "events":
              setData(mockEvents as unknown as T[]);
              break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [collectionName, user, realTime]);

  return { data, loading };
};

export { useData };
