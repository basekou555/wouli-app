import { useState, useEffect, useRef } from "react";
import { db } from "../../firebase.config";
import { collection, query, getDocs, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { mockUsers } from "@/mocks/users";
import { mockChats } from "@/mocks/chats";
import { mockMessages } from "@/mocks/messages";
import { mockEvents } from "@/mocks/events";

type CollectionName = "users" | "chats" | "messages" | "events";
type DataItem =
  | (typeof mockUsers)[number]
  | (typeof mockChats)[number]
  | (typeof mockMessages)[number]
  | (typeof mockEvents)[number];

function useData(collectionName: CollectionName, realTime: boolean = true) {
  const [data, setData] = useState<DataItem[]>([]);
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
          })) as DataItem[];

          onSnapshot(q, (snapshot) => {
            if (!firstFetch.current) {
              console.log("real time"); 
            }
            firstFetch.current = false;
            setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as DataItem[]);
          });
          setData(fetchedData as DataItem[]);
        } else if (user){
          const q = query(collection(db, collectionName));
          const querySnapshot = await getDocs(q);
          const fetchedData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(fetchedData as DataItem[]);
        } else {
          // Use mock data if user is not logged in
          switch (collectionName) {
            case "users":
              setData(mockUsers as DataItem[]);
              break;
            case "chats":
              setData(mockChats as DataItem[]);
              break;
            case "messages":
              setData(mockMessages as DataItem[]);
              break;
            case "events":
              setData(mockEvents as DataItem[]);
              break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error)
      } finally {
        setLoading(false)
      }
    };
    fetchData();
  }, [collectionName, user, realTime]);

  return { data, loading };
};
export { useData };