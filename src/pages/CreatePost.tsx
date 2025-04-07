
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { PostForm } from "@/components/PostForm";
import { PostFormData } from "@/types/blog";
import { toast } from "@/hooks/use-toast";

export default function CreatePost() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: PostFormData) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to create a post",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating post with user ID:", user.id);

      const { data: newPost, error } = await supabase
        .from("posts")
        .insert({
          title: data.title,
          content: data.content,
          author_id: user.id,
          profile_id: user.id, // Add the profile_id field
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating post:", error);
        toast({
          title: "Error",
          description: "Failed to create post. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your post has been published!",
      });

      navigate(`/posts/${newPost.id}`);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      <PostForm
        onSubmit={handleSubmit}
        isLoading={loading}
        buttonText="Publish"
      />
    </div>
  );
}
