
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData, User } from "@/hooks/useData";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebase.config";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { PrivateChatForm } from "./PrivateChatForm";
import { GroupChatForm } from "./GroupChatForm";
import { Chat } from "@/types/chat";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated?: (chat: Chat) => void;
}

const NewChatDialog = ({ open, onOpenChange, onChatCreated }: NewChatDialogProps) => {
  const { user } = useAuth();
  const { data: userData, loading: loadingUsers } = useData("users");
  const { toast } = useToast();
  const [chatType, setChatType] = useState<"private" | "group">("private");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  // Filter out current user from the list and ensure we have User objects
  const filteredUsers = userData
    .filter(item => item.id !== user?.uid && 'email' in item) as User[];

  const handleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const resetForm = () => {
    setSelectedUsers([]);
    setGroupName("");
    setChatType("private");
  };

  const handleCreateChat = async () => {
    if (!user) return;

    try {
      let newChat: any;
      
      if (chatType === "private" && selectedUsers.length === 1) {
        // Create private chat
        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, selectedUsers[0]],
          isGroup: false,
          createdAt: new Date(),
        });
        
        newChat = {
          id: docRef.id,
          participants: [user.uid, selectedUsers[0]],
          isGroup: false,
        };
        
        toast({ description: "Private chat created!" });
      } else if (chatType === "group" && selectedUsers.length > 0 && groupName) {
        // Create group chat
        const docRef = await addDoc(collection(db, "chats"), {
          name: groupName,
          participants: [user.uid, ...selectedUsers],
          isGroup: true,
          createdAt: new Date(),
        });
        
        newChat = {
          id: docRef.id,
          name: groupName,
          participants: [user.uid, ...selectedUsers],
          isGroup: true,
        };
        
        toast({ description: "Group chat created!" });
      } else {
        toast({ 
          title: "Error",
          description: "Please fill all required fields", 
          variant: "destructive" 
        });
        return;
      }
      
      resetForm();
      onOpenChange(false);
      if (onChatCreated && newChat) {
        onChatCreated(newChat as Chat);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({ 
        title: "Error",
        description: "Failed to create chat", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with friends or create a group chat
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="private" className="w-full" onValueChange={(value) => setChatType(value as "private" | "group")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private">Private Chat</TabsTrigger>
            <TabsTrigger value="group">Group Chat</TabsTrigger>
          </TabsList>
          <TabsContent value="private">
            <PrivateChatForm 
              users={filteredUsers} 
              selectedUsers={selectedUsers} 
              onUserSelect={handleUserSelection} 
              loading={loadingUsers}
            />
          </TabsContent>
          <TabsContent value="group">
            <GroupChatForm 
              users={filteredUsers} 
              selectedUsers={selectedUsers} 
              onUserSelect={handleUserSelection} 
              groupName={groupName}
              onGroupNameChange={(e) => setGroupName(e.target.value)}
              loading={loadingUsers}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateChat} disabled={selectedUsers.length === 0}>
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
